<?php

namespace App\Controller;

use App\Entity\Bet;
use App\Entity\Game;
use App\Entity\Tournament;
use App\Entity\User;
use App\Validator\BetRequestValidator;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class BetController extends AbstractController
{
    #[Route('/tournament/{tournament<\d+>}/bet/{id<\d+>?}', name: 'app_bet_get', methods: ['GET', 'OPTIONS'])]
    public function indexAction(int $tournament, ?int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $tournament]);
        if(!$tournament) {
            return $this->json(['message' => 'No valid tournament provided'], 400);
        }

        if($id) {
            $bet = $entityManager->getRepository(Bet::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

            if(!$bet) {
                return $this->json(['message' => sprintf('Bet with ID %s not found', $id)], 404);
            }

            if(!in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                if($bet->getGame()->getStart() > new DateTime()) {
                    return $this->json(['message' => sprintf('Bet with ID %s found, but not allowed to view at this time', $id)], 409);
                }
            }

            $bets = [$bet];
        } else {
            $bets = $entityManager->getRepository(Bet::class)->findBy(['isDeleted' => false]);
        }

        foreach($bets as $key => $bet) {
            if(!in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                if($bet->getGame()->getStart() > new DateTime()) {
                    unset($bets[$key]);
                }
            }

            if($bet->getGame()->getTournament() !== $tournament) {
                unset($bets[$key]);
            }
        }

        $bets = array_values($bets);

        return $this->json($bets, 200, [], [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
            'groups' => ['bet_main', 'reduced'],
            AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true
        ]);
    }

    #[Route('/bet', name: 'app_bet_put', methods: ['PUT', 'OPTIONS'])]
    public function putAction(
        Request $request,
        EntityManagerInterface $entityManager,
        BetRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            if($data["user"] !== $this->getUser()->getId() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                return $this->json(['message' => 'Not allowed to provide an user'], 400);
            }

            $game = $entityManager->getRepository(Game::class)->findOneBy(['isDeleted' => false, 'id' => $data["game"]]);

            if(!$game) {
                return $this->json(['message' => sprintf('No valid game provided: %s', $data["game"])], 400);
            }

            $now = new DateTime("now");
            if($now > $game->getStart() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                return $this->json(['message' => sprintf('Match has begun, not allowed to create bet for game: %s', $data["game"])], 403);
            }

            $bet = new Bet();

            $bet->setGame($game);
            $bet->setTeamHomeScore($data["teamHomeScore"]);
            $bet->setTeamGuestScore($data["teamGuestScore"]);

            if(array_key_exists("gameEnd", $data)) {
                $bet->setGameEnd($data["gameEnd"]);
            }

            if(array_key_exists("user", $data)) {
                $user = $entityManager->getRepository(User::class)->findOneBy(['isEnabled' => true, 'id' => $data["user"]]);
            } else {
                $user = $entityManager->getRepository(User::class)->findOneBy(['id' => $this->getUser()->getId()]);
            }

            if(!$user) {
                return $this->json(['message' => sprintf('No valid user provided: %s', $data["user"])], 400);
            }

            /**
             * @var Bet $userBet
             */
            foreach($user->getBets() as $userBet) {
                if($userBet->getGame() === $game) {
                    return $this->json(['message' => sprintf('bet already exists for this game and user: %s', $data["user"])], 409);
                }
            }

            $bet->setUser($user);

            $entityManager->persist($bet);
            $entityManager->flush();

            return $this->json(
                [
                    'message' => 'Successfully added bet',
                    'resource' => $this->generateUrl(
                        'app_bet_get',
                        ['tournament' => $game->getTournament()->getId(), 'id' => $bet->getId()],
                        UrlGeneratorInterface::ABSOLUTE_URL
                    )
                ], 201
            );
        } else {
            return $this->json(['message' => sprintf('error on adding bet: %s', $requestValidator->getErrors())], 400);
        }
    }

    #[Route('/bet/{id<\d+>}', name: 'app_bet_post', methods: ['POST', 'OPTIONS'])]
    public function postAction(
        $id,
        Request $request,
        EntityManagerInterface $entityManager,
        BetRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            /**
             * @var Bet $bet
             */
            $bet = $entityManager->getRepository(Bet::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

            if(!$bet) {
                return $this->json(['message' => sprintf('Bet with ID %s not found', $id)], 404);
            }

            if(!in_array('ROLE_ADMIN', $this->getUser()->getRoles()) && $bet->getUser() !== $this->getUser()) {
                return $this->json(['message' => 'Not allowed to edit this bet'], 403);
            }

            $game = $entityManager->getRepository(Game::class)->findOneBy(['isDeleted' => false, 'id' => $data["game"]]);

            if(!$game) {
                return $this->json(['message' => sprintf('No valid game provided: %s', $data["game"])], 400);
            }

            $now = new DateTime("now");
            if($now > $game->getStart() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                return $this->json(['message' => sprintf('Match has begun, not allowed to edit bet: %s', $id)], 403);
            }

            $bet->setGame($game);
            $bet->setTeamHomeScore($data["teamHomeScore"]);
            $bet->setTeamGuestScore($data["teamGuestScore"]);

            if(array_key_exists("gameEnd", $data)) {
                $bet->setGameEnd($data["gameEnd"]);
            }

            $entityManager->persist($bet);
            $entityManager->flush();

            return $this->json(['message' => 'Successfully edited bet']);
        } else {
            return $this->json(
                [
                    'message' => sprintf('error on editing bet: %s', $requestValidator->getErrors()),
                ], 400
            );
        }
    }

    #[Route('/bet/{id<\d+>}', name: 'app_bet_delete', methods: ['DELETE', 'OPTIONS'])]
    public function deleteAction(
        $id,
        EntityManagerInterface $entityManager,
    ): JsonResponse
    {
        $bet = $entityManager->getRepository(Bet::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

        if(!$bet) {
            return $this->json(['message' => sprintf('Bet with ID %s not found', $id)], 404);
        }

        $now = new DateTime("now");
        if($now > $bet->getGame()->getStart() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
            return $this->json(['message' => sprintf('Match has begun, not allowed to edit bet: %s', $id)], 403);
        }

        $bet->setIsDeleted(true);

        $entityManager->persist($bet);
        $entityManager->flush();

        return $this->json(['message' => 'Successfully deleted bet'], 204);
    }
}
