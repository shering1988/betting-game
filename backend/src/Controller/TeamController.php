<?php

namespace App\Controller;

use App\Entity\Bet;
use App\Entity\Game;
use App\Entity\Team;
use App\Entity\Tournament;
use App\Validator\TeamRequestValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class TeamController extends AbstractController
{
    #[Route('/tournament/{tournament<\d+>}/team/{id<\d+>?}', name: 'app_team_get', methods: ['GET', 'OPTIONS'])]
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

        if($id) {
            $team = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

            if(!$team) {
                return $this->json(['message' => sprintf('Team with ID %s not found', $id)], 404);
            }

            /**
             * @var Team[] $teams
             */
            $teams = [$entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $id])];

            /**
             * @var Game $game
             */
            foreach($teams[0]->getGames() as $game) {
                /**
                 * @var Bet $bet
                 */
                foreach($game->getBets() as $bet) {
                    if ($bet->getUser()->getId() !== $this->getUser()->getId()) {
                        $game->removeBet($bet);
                    }
                    if ($bet->isDeleted() || $game->isDeleted() || $game->getStage()->isDeleted() || $game->getTournament()->isDeleted()) {
                        $game->removeBet($bet);
                    }
                    if ($game->getTournament() !== $tournament) {
                        $game->removeBet($bet);
                    }
                }
            }
        } else {
            /**
             * @var Team[] $teams
             */
            $teams = $entityManager->getRepository(Team::class)->findBy(['isDeleted' => false]);
        }

        return $this->json($teams, 200, [], [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
            'groups' => ['team_main', 'reduced'],
            AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true,
            AbstractNormalizer::CIRCULAR_REFERENCE_LIMIT => 2
        ]);
    }

    #[Route('/team', name: 'app_team_put', methods: ['PUT', 'OPTIONS'])]
    public function putAction(
        Request $request,
        EntityManagerInterface $entityManager,
        TeamRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $team = new Team();

            $team->setName($data["name"]);
            $team->setShortName($data["shortName"]);

            $entityManager->persist($team);
            $entityManager->flush();

            return $this->json(
                [
                    'message' => 'Successfully added team',
                    'resource' => $this->generateUrl('app_team_get', ['id' => $team->getId()], UrlGeneratorInterface::ABSOLUTE_URL)
                ], 201
            );
        } else {
            return $this->json(['message' => sprintf('error on adding team: %s', $requestValidator->getErrors())], 400);
        }
    }

    #[Route('/team/{id<\d+>}', name: 'app_team_post', methods: ['POST', 'OPTIONS'])]
    public function postAction(
        $id,
        Request $request,
        EntityManagerInterface $entityManager,
        TeamRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $team = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

            if(!$team) {
                return $this->json(['message' => sprintf('Team with ID %s not found', $id)], 404);
            }

            $team->setName($data["name"]);
            $team->setShortName($data["shortName"]);

            $entityManager->persist($team);
            $entityManager->flush();

            return $this->json(['message' => 'Successfully edited team']);
        } else {
            return $this->json(
                [
                    'message' => sprintf('error on adding team: %s', $requestValidator->getErrors()),
                ], 400
            );
        }
    }

    #[Route('/team/{id<\d+>}', name: 'app_team_delete', methods: ['DELETE', 'OPTIONS'])]
    public function deleteAction(
        $id,
        EntityManagerInterface $entityManager,
    ): JsonResponse
    {
        $team = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

        if(!$team) {
            return $this->json(['message' => sprintf('Team with ID %s not found', $id)], 404);
        }

        $team->setIsDeleted(true);

        $entityManager->persist($team);
        $entityManager->flush();

        return $this->json(['message' => 'Successfully deleted team'], 204);
    }
}
