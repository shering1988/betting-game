<?php

namespace App\Controller;

use App\Constants\GameEndings;
use App\Entity\Bet;
use App\Entity\FinalsBet;
use App\Entity\Game;
use App\Entity\Team;
use App\Entity\Tournament;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

class StatisticsController extends AbstractController
{
    #[Route('/statistics/tournament/{id<\d+>}', name: 'app_statistics', methods: ['GET', 'OPTIONS'])]
    public function statisticsAction(int $id, EntityManagerInterface $entityManager): Response
    {
        $games = $entityManager->getRepository(Game::class)->findBy(['isDeleted' => false, 'tournament' => $id]);
        $finalsBets = $entityManager->getRepository(FinalsBet::class)->findBy(['isDeleted' => false, 'tournament' => $id]);
        $bets = $entityManager->getRepository(Bet::class)->findBy(['isDeleted' => false]);
        $teams = $entityManager->getRepository(Team::class)->findBy(['isDeleted' => false]);
        $users = $entityManager->getRepository(User::class)->findBy(['isEnabled' => true]);

        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

        foreach($bets as $key => $bet) {
            if($bet->getGame()->getTournament() !== $tournament || !$bet->getUser()->isEnabled()) {
                unset($bets[$key]);
            }
        }

        foreach($finalsBets as $key => $finalsBet) {
            if(!$finalsBet->getUser()->isEnabled()) {
                unset($finalsBets[$key]);
            }
        }

        $wins = [];
        $loss = [];
        $goals = [];
        $finalBetSelection = [];
        $activeUsers = [];
        $isTournamentFinished = true;
        $userBets = [];
        $results = [];

        foreach($users as $user) {
            $hasBet = false;
            /**
             * @var Bet $checkBet
             */
            foreach ($user->getBets() as $checkBet) {
                if ($checkBet->getGame()->getTournament() === $tournament) {
                    $hasBet = true;

                    if(!array_key_exists($user->getId(), $userBets)) {
                        $userBets[$user->getId()] = [
                            'user' => $user,
                            GameEndings::ENDING_CORRECT => 0,
                            GameEndings::ENDING_TENDING => 0,
                            GameEndings::ENDING_INCORRECT => 0,
                        ];

                    }
                    $userBets[$user->getId()][$checkBet->getGoalResult()] += 1;
                }
            }
            foreach ($user->getFinalsBets() as $checkFinalsBets) {
                if ($checkFinalsBets->getTournament() === $tournament) {
                    $hasBet = true;
                }
            }

            if ($hasBet) {
                $activeUsers[] = $user;
            }
        }

        foreach($games as $game) {
            if(!$game->getGameEnd()) {
                $isTournamentFinished = false;
            }

            $sortedResult = $game->getScoreTeamHome() > $game->getScoreTeamGuest() ?
                sprintf("%d:%d", $game->getScoreTeamHome(), $game->getScoreTeamGuest()) :
                sprintf("%d:%d", $game->getScoreTeamGuest(), $game->getScoreTeamHome());

            if($game->getGameEnd()) {
                if(array_key_exists($sortedResult, $results)) {
                    $results[$sortedResult]["count"]++;
                } else {
                    $results[$sortedResult] = [
                        "result" => $sortedResult,
                        "count" => 1
                    ];
                }
            }

            if($game->getScoreTeamHome() > $game->getScoreTeamGuest()) {
                if(array_key_exists($game->getTeamHome()->getId(), $wins)) {
                    $wins[$game->getTeamHome()->getId()]['wins'] += 1;
                } else {
                    $wins[$game->getTeamHome()->getId()] = ['team' => $game->getTeamHome(), 'wins' => 1];
                }
                if(array_key_exists($game->getTeamGuest()->getId(), $loss)) {
                    $loss[$game->getTeamGuest()->getId()]['loss'] += 1;
                } else {
                    $loss[$game->getTeamGuest()->getId()] = ['team' => $game->getTeamGuest(), 'loss' => 1];
                }
            }

            if($game->getScoreTeamHome() < $game->getScoreTeamGuest()) {
                if(array_key_exists($game->getTeamGuest()->getId(), $wins)) {
                    $wins[$game->getTeamGuest()->getId()]['wins'] += 1;
                } else {
                    $wins[$game->getTeamGuest()->getId()] = ['team' => $game->getTeamGuest(), 'wins' => 1];
                }
                if(array_key_exists($game->getTeamHome()->getId(), $loss)) {
                    $loss[$game->getTeamHome()->getId()]['loss'] += 1;
                } else {
                    $loss[$game->getTeamHome()->getId()] = ['team' => $game->getTeamHome(), 'loss' => 1];
                }
            }

            if(array_key_exists($game->getTeamGuest()->getId(), $goals)) {
                $goals[$game->getTeamGuest()->getId()]['goals'] += $game->getScoreTeamGuest();
                $goals[$game->getTeamGuest()->getId()]['concededGoals'] += $game->getScoreTeamHome();
            } else {
                $goals[$game->getTeamGuest()->getId()] = [
                    'team' => $game->getTeamGuest(),
                    'goals' => $game->getScoreTeamGuest(),
                    'concededGoals' => $game->getScoreTeamHome()
                ];
            }
            if(array_key_exists($game->getTeamHome()->getId(), $goals)) {
                $goals[$game->getTeamHome()->getId()]['goals'] += $game->getScoreTeamHome();
                $goals[$game->getTeamHome()->getId()]['concededGoals'] += $game->getScoreTeamGuest();
            } else {
                $goals[$game->getTeamHome()->getId()] = [
                    'team' => $game->getTeamHome(),
                    'goals' => $game->getScoreTeamHome(),
                    'concededGoals' => $game->getScoreTeamGuest()
                ];
            }
        }

        foreach($finalsBets as $finalsBet) {
            if(!$finalsBet->getUser()->isEnabled()) {
                continue;
            }

            if(array_key_exists($finalsBet->getTeamHome()->getId(), $finalBetSelection)) {
                $finalBetSelection[$finalsBet->getTeamHome()->getId()]['selected'] += 1;
            } else {
                $finalBetSelection[$finalsBet->getTeamHome()->getId()] = [
                    'team' => $finalsBet->getTeamHome(),
                    'selected' => 1,
                ];
            }
            if(array_key_exists($finalsBet->getTeamGuest()->getId(), $finalBetSelection)) {
                $finalBetSelection[$finalsBet->getTeamGuest()->getId()]['selected'] += 1;
            } else {
                $finalBetSelection[$finalsBet->getTeamGuest()->getId()] = [
                    'team' => $finalsBet->getTeamGuest(),
                    'selected' => 1,
                ];
            }
        }

        return $this->json(
            [
                'users' => count($activeUsers),
                'userBets' => array_values($userBets),
                'tournament' => [
                    'scoringLeft' => array_sum(array_map(function ($game) use ($tournament) {
                        if($game->getGameEnd()) {
                            return 0;
                        }
                        if($game->getStage()->isFinal() || $game->getStage()->isGrandFinal()) {
                            return $tournament->getGameEndScore() + $tournament->getCorrectBetScore();
                        }
                        return $tournament->getCorrectBetScore();
                    }, $games)) + ($isTournamentFinished ? 0 : $tournament->getFinalBetScore() * 2)
                ],
                'games' => [
                    'overall' => count($games),
                    'finished' => count(array_filter($games, function ($game) {
                        return $game->getGameEnd();
                    })),
                    'results' => array_values($results)
                ],
                'finalsBets' => [
                    'overall' => count($finalsBets),
                    'correct' => array_sum(array_map(function ($finalsBet) {
                        return $finalsBet->getScore()["correct"];
                    }, $finalsBets)),
                    'selectedTeams' => array_values($finalBetSelection)
                ],
                'bets' => [
                    'overall' => count($bets),
                    'correct' => count(array_filter($bets, function ($bet) {
                        return $bet->getScore()["goal_result"] === GameEndings::ENDING_CORRECT;
                    })),
                    'tending' => count(array_filter($bets, function ($bet) {
                        return $bet->getScore()["goal_result"] === GameEndings::ENDING_TENDING;
                    })),
                    'false' => count(array_filter($bets, function ($bet) {
                        return $bet->getScore()["goal_result"] === GameEndings::ENDING_INCORRECT;
                    })),
                    'open' => count(array_filter($bets, function ($bet) {
                        return !$bet->getGameEnd();
                    }))
                ],
                'teams' => [
                    'overall' => count($teams),
                    'wins' => array_values($wins),
                    'loss' => array_values($loss),
                    'goals' => array_values($goals),
                ]
            ], 200, [], [
                'circular_reference_handler' => function ($object) {
                    return $object->getId();
                },
                'groups' => ['team_main', 'reduced'],
                AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true
            ]
        );
    }
}
