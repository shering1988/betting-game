<?php

namespace App\Controller;

use App\Entity\Bet;
use App\Entity\FinalsBet;
use App\Entity\Game;
use App\Entity\PasswordToken;
use App\Entity\ProfileImage;
use App\Entity\Tournament;
use App\Entity\User;
use App\Security\EmailVerifier;
use App\Validator\RegistrationRequestValidator;
use App\Validator\ResetPasswordRequestValidator;
use App\Validator\UpdatePasswordRequestValidator;
use App\Validator\UserRequestValidator;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

class UserController extends AbstractController
{
    private EmailVerifier $emailVerifier;

    private EntityManagerInterface $em;

    public function __construct(EmailVerifier $emailVerifier, EntityManagerInterface $em)
    {
        $this->emailVerifier = $emailVerifier;
        $this->em = $em;
    }

    #[Route('/user/{id<\d+>}', name: 'app_user_edit', methods: ['POST', 'OPTIONS'])]
    public function editAction(
        $id,
        Request $request,
        EntityManagerInterface $entityManager,
        UserRequestValidator $requestValidator,
        ValidatorInterface $validator,
        UserPasswordHasherInterface $userPasswordHasher
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            /**
             * @var User $user
             */
            $user = $entityManager->getRepository(User::class)->findOneBy(['isVerified' => true, 'isEnabled' => true, 'id' => $id]);

            if(!$user) {
                return $this->json(['message' => sprintf('User with ID %s not found', $id)], 404);
            }

            if(!in_array('ROLE_ADMIN', $this->getUser()->getRoles()) && $user !== $this->getUser()) {
                return $this->json(['message' => 'Not allowed to edit this user'], 403);
            }

            if(array_key_exists("password", $data)) {
                if($data["password"] !== $data["passwordRepeat"]) {
                    return $this->json(['message' => sprintf('error on resetting password: %s', 'passwords do not match')], 409);
                }

                $user->setPassword(
                    $userPasswordHasher->hashPassword(
                        $user,
                        $data["password"]
                    )
                );
            }

            if(array_key_exists("name", $data)) {
                $user->setName($data["name"]);
            }

            $user->setSendReminder($data["reminder"]);

            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json(['message' => 'Successfully edited user']);
        } else {
            return $this->json(
                [
                    'message' => sprintf('error on editing user: %s', $requestValidator->getErrors()),
                ], 400
            );
        }
    }

    #[Route('/user/{id<\d+>}/upload', name: 'app_user_upload', methods: ['POST', 'OPTIONS'])]
    public function uploadAction(
        $id,
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger,
        CacheManager $cacheManager
    ): JsonResponse
    {
        /**
         * @var User $user
         */
        $user = $entityManager->getRepository(User::class)->findOneBy(['isVerified' => true, 'isEnabled' => true, 'id' => $id]);

        if(!$user) {
            return $this->json(['message' => sprintf('User with ID %s not found', $id)], 404);
        }

        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('profileImage');

        if(!in_array($uploadedFile->getMimeType(), [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/tiff',
            'image/gif',
        ])) {
            return $this->json(['message' => sprintf('invalid MIME type: %s', $uploadedFile->getMimeType())], 400);
        }

        if($uploadedFile->getSize() > 8388608) {
            return $this->json(['message' => sprintf('exceed allowed file size: %sb', $uploadedFile->getSize())], 400);
        }

        $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $newFilename = $safeFilename.'-'.uniqid().'.'.$uploadedFile->guessExtension();

        try {
            $uploadedFile->move(
                $this->getParameter('profile_image_directory'),
                $newFilename
            );
        } catch (FileException $e) {
            return $this->json(['message' => sprintf('error on saving file: %s', $e->getMessage())], 500);
        }

        if($user->getProfileImage()) {
            $profileImage = $user->getProfileImage();
        } else {
            $profileImage = new ProfileImage();
        }
        $profileImage->setUser($user);
        $profileImage->setPath(
            $cacheManager->getBrowserPath($this->getParameter('profile_image_directory_relative') . $newFilename, 'profile_images')
        );

        $entityManager->persist($profileImage);
        $entityManager->flush();

        $user->setProfileImage($profileImage);

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json(['message' => sprintf('profile image uploaded successfully with id %s for user %s', $profileImage->getId(), $user->getId())], 200);
    }

    #[Route('/tournament/{tournament<\d+>}/user/{id<\d+>?}', name: 'app_user_get', methods: ['GET', 'OPTIONS'])]
    public function indexAction(
        int $tournament,
        ?int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse
    {
        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $tournament]);

        if(!$tournament) {
            return $this->json(['message' => sprintf('Tournament with ID %s not found', $id)], 404);
        }

        $finalStageGames = null;
        $openingGame = $entityManager->getRepository(Game::class)->findOneBy(['tournament' => $tournament, 'isDeleted' => false], ['start' => 'ASC']);
        $isFinalStage = count($entityManager->getRepository(Game::class)->findUpComingGroupStageGames($tournament)) === 0;
        if($isFinalStage) {
            $finalStageGames = $entityManager->getRepository(Game::class)->findUpComingFinalStageGames($tournament, true);
        }

        $constraint = ['isVerified' => true, 'isEnabled' => true];
        if(in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
            $constraint = ['isVerified' => true];
        }

        if($id) {
            $users = $entityManager->getRepository(User::class)->findOneBy(array_merge($constraint, ['id' => $id]));

            if(!$users) {
                return $this->json(['message' => sprintf('User with ID %s not found', $id)], 404);
            }

            $users = [$users];
        } else {
            $users = $entityManager->getRepository(User::class)->findBy($constraint);
        }

        foreach($users as $user) {
            /**
             * @var FinalsBet $finalsBet
             */
            foreach($user->getFinalsBets() as $finalsBet) {
                if(!$openingGame) {
                    if($finalsBet->getUser()->getId() !== $this->getUser()->getId() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                        $user->removeFinalsBet($finalsBet);
                    }
                } else {
                    if($openingGame->getStart() > new DateTime()) {
                        if($finalsBet->getUser()->getId() !== $this->getUser()->getId() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                            $user->removeFinalsBet($finalsBet);
                        }
                    }
                }
                if($finalsBet->getTournament() !== $tournament) {
                    $user->removeFinalsBet($finalsBet);
                }

                $finalsBet->setIsTeamHomeEliminated(true);
                $finalsBet->setIsTeamGuestEliminated(true);
                if(count($finalStageGames) > 0) {
                    /**
                     * @var Game $finalStageGame
                     */
                    foreach($finalStageGames as $finalStageGame) {
                        if($finalStageGame->getTeamGuest() === $finalsBet->getTeamGuest() || $finalStageGame->getTeamHome() === $finalsBet->getTeamGuest()) {
                            $finalsBet->setIsTeamGuestEliminated(false);
                        }

                        if($finalStageGame->getTeamGuest() === $finalsBet->getTeamHome() || $finalStageGame->getTeamHome() === $finalsBet->getTeamHome()) {
                            $finalsBet->setIsTeamHomeEliminated(false);
                        }
                    }
                }
            }

            /**
             * @var Bet $bet
             */
            foreach($user->getBets() as $bet) {
                if(!in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                    if(!$bet->getGame()->getGameEnd() && $bet->getUser()->getId() !== $this->getUser()->getId()) {
                        $user->removeBet($bet);
                    }
                }
                if($bet->getGame()->isDeleted() || $bet->getGame()->getStage()->isDeleted() || $bet->getGame()->getTournament()->isDeleted()) {
                    $user->removeBet($bet);
                }
                if($bet->getGame()->getTournament() !== $tournament) {
                    $user->removeBet($bet);
                }
            }
        }

        return $this->json($users, 200, [], [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
            'groups' => ['user_main', 'reduced'],
            AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true
        ]);
    }

    #[Route('/forgot-password', name: 'app_forgot_password_request', methods: ['PUT', 'OPTIONS'])]
    public function forgotPasswordRequest(
        Request $request,
        MailerInterface $mailer,
        ResetPasswordRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $user = $this->em->getRepository(User::class)->findOneBy(['email' => $data["email"]]);
            $existingToken = $this->em->getRepository(PasswordToken::class)->findOneBy(['user' => $user]);

            if(!$user) {
                return $this->json(['message' => sprintf('No valid email provided: %s', $data["email"])], 404);
            }

            if($existingToken) {
                return $this->json(['message' => sprintf('Pending reset for user: %s', $data["email"])], 409);
            }

            $date = new DateTimeImmutable("now");

            $passwordToken = new PasswordToken();
            $passwordToken->setExpiresAt($date->modify("+1 day"));
            $passwordToken->setToken(md5($user->getId() . time()));
            $passwordToken->setUser($user);
            $this->em->persist($passwordToken);
            $this->em->flush();

            $message = (new Email())
                ->to($user->getEmail())
                ->subject('Tippspiel: Passwort zurücksetzen')
                ->text(
                    sprintf(
                        "Hallo,\r\n\r\ndu hast eine Abfrage eingereicht um dein Passwort zurückzusetzen.\r\n\r\nFolge bitte diesem Link um ein neues Passwort zu erstellen: ".$this->getParameter('frontend_url')."/forgot-password/%s (Der Link ist einen Tag lang gültig)\r\n\r\nFalls du dein Passwort nicht zurücksetzen wolltest, kannst du diese Email ignorieren.\r\n\r\nGrüße vom Tippspiel",
                        $passwordToken->getToken()
                    )
                );
            $mailer->send($message);

            return $this->json([ 'message' => 'Successfully added password request'], 201);
        } else {
            return $this->json(['message' => sprintf('error on resetting password: %s', $requestValidator->getErrors())], 400);
        }
    }

    #[Route('/forgot-password/{token}', name: 'app_update_password', methods: ['POST', 'OPTIONS'])]
    public function updatePassword(
        $token,
        Request $request,
        UpdatePasswordRequestValidator $requestValidator,
        ValidatorInterface $validator,
        UserPasswordHasherInterface $userPasswordHasher
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $existingToken = $this->em->getRepository(PasswordToken::class)->findOneBy(['token' => $token]);

            if(!$existingToken) {
                return $this->json(['message' => sprintf('Token not found: %s', $token)], 404);
            }

            if($existingToken->isExpired()) {
                return $this->json(['message' => sprintf('Request expired for token: %s', $token)], 410);
            }

            if($data["password"] !== $data["passwordRepeat"]) {
                return $this->json(['message' => sprintf('error on resetting password: %s', 'passwords do not match')], 400);
            }

            $user = $this->em->getRepository(User::class)->findOneBy(['id' => $existingToken->getUser()->getId()]);
            $user->setPassword(
                $userPasswordHasher->hashPassword(
                    $user,
                    $data["password"]
                )
            );
            $this->em->persist($user);
            $this->em->flush();

            $this->em->remove($existingToken);
            $this->em->flush();

            return $this->json([ 'message' => 'Successfully reset password'], 200);
        } else {
            return $this->json(['message' => sprintf('error on resetting password: %s', $requestValidator->getErrors())], 400);
        }
    }

    #[Route('/register', name: 'app_register', methods: ['PUT', 'OPTIONS'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface $entityManager,
        RegistrationRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): Response
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $repo = $this->em->getRepository(User::class);
            $user = $repo->findBy(['email' => $data["email"]]);
            if(count($user) > 0) {
                return $this->json(['message' => sprintf('error on registering user: %s', 'email already exists')], 409);
            }

            $user = new User();

            if($data["password"] !== $data["passwordRepeat"]) {
                return $this->json(['message' => sprintf('error on registering user: %s', 'passwords do not match')], 401);
            }

            if($data["secret"] !== $this->getParameter('registration_secret')) {
                return $this->json(['message' => sprintf('error on registering user: %s', 'invalid secret')], 403);
            }

            $user->setPassword(
                $userPasswordHasher->hashPassword(
                    $user,
                    $data["password"]
                )
            );
            $user->setEmail(strtolower($data["email"]));
            $user->setName($data["name"]);
            $user->setRoles(['ROLE_USER']);
            $user->setIsVerified(false);
            $user->setIsEnabled(true);
            $user->setSendReminder($data["reminder"]);

            $entityManager->persist($user);
            $entityManager->flush();

            $this->emailVerifier->sendEmailConfirmation('app_verify_email', $user);

            return $this->json(
                ['message' => 'Successfully registered user'], 201
            );
        } else {
            return $this->json(['message' => sprintf('error on registering user: %s', $requestValidator->getErrors())], 400);
        }
    }

    #[Route('/verify/email', name: 'app_verify_email', methods: ['GET', 'OPTIONS'])]
    public function verifyUserEmail(
        Request $request
    ): Response
    {
        $id = $request->query->get('id');

        if (null === $id) {
            return $this->json(['message' => sprintf('error on verifying user: %s', 'no id provided')], 400);
        }

        $repo = $this->em->getRepository(User::class);
        $user = $repo->find($id);

        if (null === $user) {
            return $this->json(['message' => sprintf('error on verifying user: %s', 'user not found')], 404);
        }

        try {
            $this->emailVerifier->handleEmailConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $exception) {
            return $this->json(['message' => sprintf('error on verifying user: %s', $exception->getReason())], 500);
        }

        return $this->json(['message' => 'verification succeeded'], 200);
    }

    #[Route('/user/{id<\d+>}/toggle', name: 'app_user_toggle_active', methods: ['POST', 'OPTIONS'])]
    public function toggleAction(Request $request, $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->findOneBy(['id' => $id]);

        if(!$user) {
            return $this->json(['message' => sprintf('User with ID %s not found', $id)], 404);
        }

        $user->setIsEnabled(!$user->isEnabled());

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json(['message' => 'Successfully toggled user'], 200);
    }
}
