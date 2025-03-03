<?php

namespace App\Controller;

use App\Constants\GameEndings;
use App\Entity\Bet;
use App\Entity\Game;
use App\Entity\Tournament;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class RankingController extends AbstractController
{
    #[Route('/ranking/tournament/{id<\d+>}', name: 'app_ranking_list', methods: ['GET', 'OPTIONS'])]
    public function listAction($id, EntityManagerInterface $entityManager): JsonResponse
    {
        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

        if(!$tournament) {
            return $this->json(['message' => sprintf('Tournament with ID %s not found', $id)], 404);
        }

        $users = $entityManager->getRepository(User::class)->findBy(['isEnabled' => true]);

        $ranking = $this->calculateRanking($users, $tournament, $entityManager);

        return $this->json($ranking);
    }

    #[Route('/chart/tournament/{id<\d+>}', name: 'app_ranking_chart', methods: ['GET', 'OPTIONS'])]
    public function chartAction($id, EntityManagerInterface $entityManager): JsonResponse
    {
        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

        if(!$tournament) {
            return $this->json(['message' => sprintf('Tournament with ID %s not found', $id)], 404);
        }

        $xAxis = [];
        $games = $entityManager->getRepository(Game::class)->findBy(['isDeleted' => false, 'tournament' => $tournament], ["start" => "ASC"]);
        foreach($games as $game) {
            if($game->getGameEnd()) {
                $xAxis[] = date_format($game->getStart(), "d.m.Y");
            }
        }
        $xAxis = array_unique($xAxis);

        $returnScores = [];
        $users = $entityManager->getRepository(User::class)->findBy(['isEnabled' => true]);

        foreach($xAxis as $date) {
            $returnScores[] = [
                "date" => $date,
            ];
            foreach($this->calculateRanking($users, $tournament, $entityManager, $date) as $currentDayRanking) {
                $returnScores[count($returnScores) - 1][$currentDayRanking['user']['id']] =
                    (count($returnScores) - 1 < 0 ? 0 : $returnScores[count($returnScores) - 2][$currentDayRanking['user']['id']]) +
                    $currentDayRanking['score'];
            }
        }

        return $this->json([
            'lines' => array_map(function($user) {
                return [
                    "name" => $user->getName(),
                    "id" => $user->getId(),
                    "color" => sprintf('#%06X', mt_rand(382, 0xFFFFFF))
                ];
            }, $users),
            'users' => array_values($returnScores)
        ]);
    }

    protected function calculateRanking($users, Tournament $tournament, EntityManagerInterface $entityManager, $date = null): array
    {
        $ranking = [];
        $finalGame = null;

        $games = $entityManager->getRepository(Game::class)->findBy(["tournament" => $tournament]);
        foreach($games as $game) {
            if($game->getStage()->isGrandFinal()) {
                $finalGame = $game;
                break;
            }
        }

        /**
         * @var User $user
         */
        foreach($users as $user) {
            $hasBet = false;
            $currentFinalsBet = null;
            foreach($user->getBets() as $checkBet) {
                if($checkBet->getGame()->getTournament() === $tournament) {
                    $hasBet = true;
                }
            }
            foreach($user->getFinalsBets() as $checkFinalsBets) {
                if($checkFinalsBets->getTournament() === $tournament) {
                    $hasBet = true;
                    $currentFinalsBet = $checkFinalsBets;
                }
            }

            if(!$hasBet) {
                continue;
            }

            $ranking[$user->getId()][GameEndings::ENDING_INCORRECT] = 0;
            $ranking[$user->getId()][GameEndings::ENDING_CORRECT] = 0;
            $ranking[$user->getId()][GameEndings::ENDING_TENDING] = 0;
            $ranking[$user->getId()]['game_end'] = 0;
            $ranking[$user->getId()]['finals_bet'] = 0;
            $ranking[$user->getId()]['average'] = 0;
            $ranking[$user->getId()]['score'] = 0;
            $ranking[$user->getId()]['bets'] = 0;
            $ranking[$user->getId()]['user'] = [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'profileImage' => $user->getProfileImage() ? ['id' => $user->getProfileImage()->getId(), 'path' => $user->getProfileImage()->getPath()] : null,
            ];
            $ranking[$user->getId()]['id'] = $user->getId();

            if($finalGame && $currentFinalsBet) {
                if(
                    $finalGame->getTeamHome() === $currentFinalsBet->getTeamHome() ||
                    $finalGame->getTeamGuest() === $currentFinalsBet->getTeamHome()
                ) {
                    if($date) {
                        if(date_format($finalGame->getStart(), "d.m.Y") === $date) {
                            $ranking[$user->getId()]['finals_bet']++;
                            $ranking[$user->getId()]['score'] += $tournament->getFinalBetScore();
                        }
                    } else {
                        $ranking[$user->getId()]['finals_bet']++;
                        $ranking[$user->getId()]['score'] += $tournament->getFinalBetScore();
                    }
                }

                if(
                    $finalGame->getTeamHome() === $currentFinalsBet->getTeamGuest() ||
                    $finalGame->getTeamGuest() === $currentFinalsBet->getTeamGuest()
                ) {
                    if($date) {
                        if(date_format($finalGame->getStart(), "d.m.Y") === $date) {
                            $ranking[$user->getId()]['finals_bet']++;
                            $ranking[$user->getId()]['score'] += $tournament->getFinalBetScore();
                        }
                    } else {
                        $ranking[$user->getId()]['finals_bet']++;
                        $ranking[$user->getId()]['score'] += $tournament->getFinalBetScore();
                    }
                }
            }

            /**
             * @var Bet $bet
             */
            foreach($user->getBets() as $bet) {
                if(
                    $bet->getGame()->getTournament() !== $tournament ||
                    !$bet->getGame()->getGameEnd()
                ) {
                    continue;
                }

                if($date) {
                    if(date_format($bet->getGame()->getStart(), "d.m.Y") !== $date) {
                        continue;
                    }
                }

                $ranking[$user->getId()]['bets']++;

                switch($bet->getGoalResult()) {
                    case GameEndings::ENDING_INCORRECT:
                        $ranking[$user->getId()][GameEndings::ENDING_INCORRECT]++;
                        break;
                    case GameEndings::ENDING_CORRECT:
                        $ranking[$user->getId()][GameEndings::ENDING_CORRECT]++;
                        $ranking[$user->getId()]['score'] += $tournament->getCorrectBetScore();
                        break;
                    case GameEndings::ENDING_TENDING:
                        $ranking[$user->getId()][GameEndings::ENDING_TENDING]++;
                        $ranking[$user->getId()]['score'] += $tournament->getTendingBetScore();
                        break;
                }

                switch($bet->getGameEndResult()) {
                    case GameEndings::ENDING_CORRECT:
                        if($bet->getGame()->getStage()->isGrandFinal() || $bet->getGame()->getStage()->isFinal()) {
                            $ranking[$user->getId()]['game_end']++;
                            $ranking[$user->getId()]['score'] += $tournament->getGameEndScore();
                        }
                        break;
                    default:
                        break;
                }
            }

            if($ranking[$user->getId()]['bets'] > 0) {
                $ranking[$user->getId()]['average'] = round(($ranking[$user->getId()]['score'] / $ranking[$user->getId()]['bets']), 2);
            }
        }

        $points = [];
        $correct = [];
        $tending = [];
        foreach($ranking as $name => $data) {
            $points[$name]   = $data['score'];
            $correct[$name]  = $data[GameEndings::ENDING_CORRECT];
            $tending[$name]  = $data[GameEndings::ENDING_TENDING];
        }

        array_multisort($points, SORT_DESC, $correct, SORT_DESC, $tending, SORT_DESC, $ranking);

        return $ranking;
    }
}
