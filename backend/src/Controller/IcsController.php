<?php

namespace App\Controller;

use App\Entity\Game;
use DateInterval;
use DateTime;
use DateTimeZone;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class IcsController extends AbstractController
{
    #[Route('/ics-download/tournament/{id<\d+>}', name: 'app_ics_download', methods: ['GET', 'OPTIONS'])]
    public function calendarDownloadAction(int $id, EntityManagerInterface $entityManager): Response
    {
        $games = $entityManager->getRepository(Game::class)->findBy(['isDeleted' => false, 'tournament' => $id]);

        $content = $this->generateICSForDownload($games);
        return $this->sendFile($content);
    }

    #[Route('/ics/tournament/{id<\d+>}', name: 'app_ics', methods: ['GET', 'OPTIONS'])]
    public function calendarAction(int $id, EntityManagerInterface $entityManager): Response
    {
        $games = $entityManager->getRepository(Game::class)->findBy(['isDeleted' => false, 'tournament' => $id]);

        return new Response(
            $this->generateICSForURL($games),
            200,
            array(
                'Content-Type' => 'text/calendar; charset=utf-8',
            )
        );
    }

    protected function generateICSForURL($games): string
    {
        $ics = "BEGIN:VCALENDAR\nVERSION:2.0\nX-WR-TIMEZONE:Europe/Berlin\nPRODID:PHP\nMETHOD:REQUEST\n";
        /**
         * @var $game Game
         */
        foreach($games as $game) {
            $startDate = $game->getStart()->format("Y-m-d H:i:s");
            $endDate = $game->getStart()->add(new DateInterval('PT100M'))->format("Y-m-d H:i:s");

            $startDateUTC = new DateTime($startDate, new DateTimeZone('UTC'));
            $endDateUTC = new DateTime($endDate, new DateTimeZone('UTC'));

            $ics .= "BEGIN:VEVENT\nUID:".$game->getId()."\nDTSTART:".$startDateUTC->modify("-2 hours")->format('Ymd\THis\Z')."\nDTEND:".$endDateUTC->modify("-2 hours")->format('Ymd\THis\Z')."\nSUMMARY:".$game->getTeamHome()->getName()." vs. ".$game->getTeamGuest()->getName()." (".$game->getStage()->getName().")\nDTSTAMP:".date('Ymd').'T'.date('His')."\nBEGIN:VALARM\nTRIGGER:-PT15M\nACTION:DISPLAY\nDESCRIPTION:Reminder\nEND:VALARM\nEND:VEVENT\n";
        }
        $ics .= "END:VCALENDAR\n";
        return $ics;
    }

    protected function generateICSForDownload($games): string
    {
        $ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:PHP\nMETHOD:REQUEST\n";
        /**
         * @var $game Game
         */
        foreach($games as $game) {
            $ics .= "BEGIN:VEVENT\nUID:".$game->getId()."\nDTSTART:".($game->getStart()->format('Ymd\THis'))."\nDTEND:".($game->getStart()->add(new DateInterval('PT100M'))->format('Ymd\THis'))."\nSUMMARY:".$game->getTeamHome()->getName()." vs. ".$game->getTeamGuest()->getName()." (".$game->getStage()->getName().")\nDTSTAMP:".date('Ymd').'T'.date('His')."\nBEGIN:VALARM\nTRIGGER:-PT15M\nACTION:DISPLAY\nDESCRIPTION:Reminder\nEND:VALARM\nEND:VEVENT\n";
        }
        $ics .= "END:VCALENDAR\n";
        return $ics;
    }

    protected function sendFile($content): Response
    {
        $response = new Response();

        $response->headers->set('Content-Type', 'text/calendar');
        $response->headers->set('Content-Disposition', 'attachment; filename="spielplan.ics"');
        $response->headers->set('Content-Length', strlen($content));

        $response->setContent($content);

        return $response;
    }
}
