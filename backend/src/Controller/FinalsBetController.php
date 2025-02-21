<?php

namespace App\Controller;

use App\Entity\FinalsBet;
use App\Entity\Game;
use App\Entity\Team;
use App\Entity\Tournament;
use App\Entity\User;
use App\Validator\FinalsBetRequestValidator;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class FinalsBetController extends AbstractController
{
    #[Route('/tournament/{tournament<\d+>}/finalsBet/{id<\d+>?}', name: 'app_finals_bet_get', methods: ['GET', 'OPTIONS'])]
    public function indexAction(int $tournament, ?int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $tournament]);
        if(!$tournament) {
            return $this->json(['message' => 'No valid tournament provided'], 400);
        }

        $finalStageGames = null;
        $openingGame = $entityManager->getRepository(Game::class)->findOneBy(['tournament' => $tournament, 'isDeleted' => false], ['start' => 'ASC']);
        $isFinalStage = count($entityManager->getRepository(Game::class)->findUpComingGroupStageGames($tournament)) === 0;
        if($isFinalStage) {
            $finalStageGames = $entityManager->getRepository(Game::class)->findUpComingFinalStageGames($tournament, true);
        }

        if($id) {
            $finalsBet = $entityManager->getRepository(FinalsBet::class)->findOneBy(['isDeleted' => false, 'id' => $id, 'tournament' => $tournament]);

            if(!$finalsBet) {
                return $this->json(['message' => sprintf('FinalsBet with ID %s not found', $id)], 404);
            }

            $finalsBets = [$finalsBet];
        } else {
            $finalsBets = $entityManager->getRepository(FinalsBet::class)->findBy(['isDeleted' => false, 'tournament' => $tournament]);
        }

        foreach($finalsBets as $key => $finalsBet) {
            if(!$openingGame) {
                if($finalsBet->getUser()->getId() !== $this->getUser()->getId() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                    unset($finalsBets[$key]);
                }
            } else {
                if($openingGame->getStart() > new DateTime()) {
                    if($finalsBet->getUser()->getId() !== $this->getUser()->getId() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                        unset($finalsBets[$key]);
                    }
                }
            }
            if($finalsBet->getTournament() !== $tournament) {
                unset($finalsBets[$key]);
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

        $finalsBets = array_values($finalsBets);

        return $this->json($finalsBets, 200, [], [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
            'groups' => ['finals_bet_main', 'reduced'],
            AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true
        ]);
    }

    #[Route('/finalsBet', name: 'app_finals_bet_put', methods: ['PUT', 'OPTIONS'])]
    public function putAction(
        Request $request,
        EntityManagerInterface $entityManager,
        FinalsBetRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            if($data["user"] !== $this->getUser()->getId() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                return $this->json(['message' => 'Not allowed to provide an user'], 400);
            }

            $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $data["tournament"]]);
            $teamHome = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $data["teamHome"]]);
            $teamGuest = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $data["teamGuest"]]);

            if(!$tournament) {
                return $this->json(['message' => sprintf('No valid tournament provided: %s', $data["tournament"])], 400);
            }
            if($tournament->getHasTournamentStarted() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                return $this->json(['message' => sprintf('Not allowed to place finalsBet, tournament already started: %s', $data["tournament"])], 403);
            }
            if(!$teamHome) {
                return $this->json(['message' => sprintf('No valid home team provided: %s', $data["teamHome"])], 400);
            }
            if(!$teamGuest) {
                return $this->json(['message' => sprintf('No valid guest team provided: %s', $data["teamGuest"])], 400);
            }

            $finalsBet = new FinalsBet();

            $finalsBet->setTeamGuest($teamGuest);
            $finalsBet->setTeamHome($teamHome);
            $finalsBet->setTournament($tournament);

            if(array_key_exists("user", $data)) {
                $user = $entityManager->getRepository(User::class)->findOneBy(['isEnabled' => true, 'id' => $data["user"]]);

                if(!$user) {
                    return $this->json(['message' => sprintf('No valid user provided: %s', $data["user"])], 400);
                }
            } else {
                $user = $entityManager->getRepository(User::class)->findOneBy(['isEnabled' => true, 'id' => $this->getUser()->getId()]);
            }
            $finalsBet->setUser($user);

            $finalsBetCheck = $entityManager->getRepository(FinalsBet::class)->findOneBy(['isDeleted' => false, 'tournament' => $tournament, 'user' => $user]);
            if($finalsBetCheck) {
                return $this->json(
                    [
                        'message' => 'finalsBet already exists for this tournament and user',
                        'resource' => $this->generateUrl(
                            'app_finals_bet_get',
                            ['tournament' => $tournament->getId(), 'id' => $finalsBetCheck->getId()],
                            UrlGeneratorInterface::ABSOLUTE_URL
                        )
                    ],
                    409
                );
            }

            $entityManager->persist($finalsBet);
            $entityManager->flush();

            return $this->json(
                [
                    'message' => 'Successfully added finalsBet',
                    'resource' => $this->generateUrl(
                        'app_finals_bet_get',
                        ['tournament' => $tournament->getId(), 'id' => $finalsBet->getId()],
                        UrlGeneratorInterface::ABSOLUTE_URL
                    )
                ], 201
            );
        } else {
            return $this->json(['message' => sprintf('error on adding finalsBet: %s', $requestValidator->getErrors())], 400);
        }
    }

    #[Route('/finalsBet/{id<\d+>}', name: 'app_finals_bet_post', methods: ['POST', 'OPTIONS'])]
    public function postAction(
        $id,
        Request $request,
        EntityManagerInterface $entityManager,
        FinalsBetRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            /**
             * @var FinalsBet $finalsBet
             */
            $finalsBet = $entityManager->getRepository(FinalsBet::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

            if(!$finalsBet) {
                return $this->json(['message' => sprintf('FinalsBet with ID %s not found', $id)], 404);
            }

            if(!in_array('ROLE_ADMIN', $this->getUser()->getRoles()) && $finalsBet->getUser() !== $this->getUser()) {
                return $this->json(['message' => 'Not allowed to edit this finalsBet'], 403);
            }

            $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $data["tournament"]]);
            $teamHome = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $data["teamHome"]]);
            $teamGuest = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $data["teamGuest"]]);

            if(!$tournament) {
                return $this->json(['message' => sprintf('No valid tournament provided: %s', $data["tournament"])], 400);
            }
            if($tournament->getHasTournamentStarted() && !in_array('ROLE_ADMIN', $this->getUser()->getRoles())) {
                return $this->json(['message' => sprintf('Not allowed to place finalsBet, tournament already started: %s', $data["tournament"])], 403);
            }
            if(!$teamHome) {
                return $this->json(['message' => sprintf('No valid home team provided: %s', $data["teamHome"])], 400);
            }
            if(!$teamGuest) {
                return $this->json(['message' => sprintf('No valid guest team provided: %s', $data["teamGuest"])], 400);
            }

            $finalsBet->setTeamGuest($teamGuest);
            $finalsBet->setTeamHome($teamHome);
            $finalsBet->setTournament($tournament);

            $entityManager->persist($finalsBet);
            $entityManager->flush();

            return $this->json(['message' => 'Successfully edited finalsBet']);
        } else {
            return $this->json(
                [
                    'message' => sprintf('error on adding finalsBet: %s', $requestValidator->getErrors()),
                ], 400
            );
        }
    }

    #[Route('/finalsBet/{id<\d+>}', name: 'app_finals_bet_delete', methods: ['DELETE', 'OPTIONS'])]
    public function deleteAction(
        $id,
        EntityManagerInterface $entityManager,
    ): JsonResponse
    {
        $finalsBet = $entityManager->getRepository(FinalsBet::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

        if(!$finalsBet) {
            return $this->json(['message' => sprintf('FinalsBet with ID %s not found', $id)], 404);
        }

        $finalsBet->setIsDeleted(true);

        $entityManager->persist($finalsBet);
        $entityManager->flush();

        return $this->json(['message' => 'Successfully deleted finalsBet'], 204);
    }
}
