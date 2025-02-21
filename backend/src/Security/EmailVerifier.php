<?php

namespace App\Security;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Security\Core\User\UserInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;
use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;

class EmailVerifier
{
    public function __construct(
        private VerifyEmailHelperInterface $verifyEmailHelper,
        private MailerInterface                     $mailer,
        private EntityManagerInterface              $entityManager
    ) {
    }

    public function sendEmailConfirmation(string $verifyEmailRouteName, UserInterface $user): void
    {
        $signatureComponents = $this->verifyEmailHelper->generateSignature(
            $verifyEmailRouteName,
            $user->getId(),
            $user->getEmail(),
            ['id' => $user->getId()]
        );

        $message = (new Email())
            ->to($user->getEmail())
            ->subject('Betting Game: Konto bestätigen')
            ->text(
                sprintf(
                    "Hallo,\r\n\r\ndu hast dich soeben mit deiner Email-Adresse beim Tippspiel registriert.\r\n\r\nKlicke bitte auf diesen Link um deine Registrierung zu bestätigen: ".$this->getParameter('frontend_url')."/verify/?url=%s\r\n\r\nGrüße vom Tippspiel",
                    rawurlencode($signatureComponents->getSignedUrl())
                )
            );
        $this->mailer->send($message);
    }

    /**
     * @throws VerifyEmailExceptionInterface
     */
    public function handleEmailConfirmation(Request $request, UserInterface $user): void
    {
        /**
         * @var User $user
         */
        $this->verifyEmailHelper->validateEmailConfirmation($request->getUri(), $user->getId(), $user->getEmail());

        $user->setIsVerified(true);

        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }
}
