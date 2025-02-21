<?php

namespace App\Controller;

use App\Constants\MailConstants;
use App\Entity\Game;
use App\Entity\Tournament;
use App\Entity\User;
use App\Service\MailerService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\Annotation\Route;

class CronController extends AbstractController
{
    #[Route('/cron', name: 'app_cron', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager, MailerService $mailerService, MailerInterface $mailer): JsonResponse
    {
        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'isActive' => true]);
        $users = $entityManager->getRepository(User::class)->findBy(['isVerified' => true, 'isEnabled' => true, 'sendReminder' => true]);

        if(!$tournament || !$users) {
            return $this->json(['no tournament or users found'], 404);
        }

        $games = $entityManager->getRepository(Game::class)->findUpComingGames($tournament);

        $send = 0;
        foreach($users as $user) {
            $hasMissingBet = [];

            /**
             * @var Game $game
             */
            foreach($games as $game) {
                $hasBet = false;
                foreach($game->getBets() as $bet) {
                    if($bet->getUser()->getId() === $user->getId() && $bet->isDeleted() === false) {
                        $hasBet = true;
                    }
                }

                if(!$hasBet) {
                    $hasMissingBet[] = $game;
                }
            }

            if(count($hasMissingBet) > 0) {
                $mailerService->sendPlainTextMessage(
                    MailConstants::SEND_REMINDER_SUBJECT,
                    sprintf(MailConstants::SEND_REMINDER_BODY, implode(', ', array_map(function(Game $game) {
                        return sprintf(
                            MailConstants::SEND_REMINDER_GAME_ITEM,
                            $game->getTeamHome()->getName(),
                            $game->getTeamGuest()->getName(),
                            $game->getStart()->format("H:i")
                        );
                    }, $hasMissingBet))),
                    $user->getEmail(),
                    $mailer
                );

                $send++;
            }
        }

        return $this->json(['games_affected' => count($games), 'mails_send' => $send]);
    }
}