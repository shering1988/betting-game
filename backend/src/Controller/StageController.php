<?php

namespace App\Controller;

use App\Entity\Bet;
use App\Entity\Game;
use App\Entity\Stage;
use App\Entity\Tournament;
use App\Validator\StageRequestValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StageController extends AbstractController
{
    #[Route('/tournament/{tournament<\d+>}/stage/{id<\d+>?}', name: 'app_stage_get', methods: ['GET', 'OPTIONS'])]
    public function indexAction(int $tournament, ?int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $tournament]);

        if(!$tournament) {
            return $this->json(['message' => sprintf('Tournament with ID %s not found', $id)], 404);
        }

        if($id) {
            $stage = $entityManager->getRepository(Stage::class)->findOneBy(['isDeleted' => false, 'id' => $id, 'tournament' => $tournament]);

            if(!$stage) {
                return $this->json(['message' => sprintf('Stage with ID %s not found', $id)], 404);
            }

            /**
             * @var Stage[] $stage
             */
            $stage = [$stage];

            /**
             * @var Game $game
             */
            foreach($stage[0]->getGames() as $game) {
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
             * @var Stage[] $stage
             */
            $stage = $entityManager->getRepository(Stage::class)->findBy(['isDeleted' => false, 'tournament' => $tournament]);
        }

        return $this->json($stage, 200, [], [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
            'groups' => ['stage_main', 'reduced'],
            AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true,
            AbstractNormalizer::CIRCULAR_REFERENCE_LIMIT => 2
        ]);
    }

    #[Route('/stage', name: 'app_stage_put', methods: ['PUT', 'OPTIONS'])]
    public function putAction(
        Request $request,
        EntityManagerInterface $entityManager,
        StageRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $data["tournament"]]);

            if(!$tournament) {
                return $this->json(['message' => sprintf('No valid tournament provided: %s', $data["tournament"])], 400);
            }

            $finalStage = $entityManager->getRepository(Stage::class)->findOneBy(['isGrandFinal' => true, 'isDeleted' => false, 'tournament' => $data["tournament"]]);

            if($finalStage && $data["isGrandFinal"] === true) {
                return $this->json(['message' => sprintf('Grand Final already exists for this tournament: %s', $data["tournament"])], 409);
            }

            $stage = new Stage();

            $stage->setName($data["name"]);
            $stage->setIsFinal($data["isFinal"]);
            $stage->setIsGrandFinal($data["isGrandFinal"]);
            $stage->setTournament($tournament);

            $entityManager->persist($stage);
            $entityManager->flush();

            return $this->json(
                [
                    'message' => 'Successfully added stage',
                    'resource' => $this->generateUrl('app_stage_get', ['tournament' => $tournament->getId(), 'id' => $stage->getId()], UrlGeneratorInterface::ABSOLUTE_URL)
                ], 201
            );
        } else {
            return $this->json(['message' => sprintf('error on adding stage: %s', $requestValidator->getErrors())], 400);
        }
    }

    #[Route('/stage/{id<\d+>}', name: 'app_stage_post', methods: ['POST', 'OPTIONS'])]
    public function postAction(
        $id,
        Request $request,
        EntityManagerInterface $entityManager,
        StageRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $stage = $entityManager->getRepository(Stage::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

            if(!$stage) {
                return $this->json(['message' => sprintf('Stage with ID %s not found', $id)], 404);
            }

            $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $data["tournament"]]);

            if(!$tournament) {
                return $this->json(['message' => sprintf('No valid tournament provided: %s', $data["tournament"])], 400);
            }

            $finalStage = $entityManager->getRepository(Stage::class)->findOneBy(['isGrandFinal' => true, 'isDeleted' => false, 'tournament' => $data["tournament"]]);

            if($finalStage && $finalStage != $stage && $data["isGrandFinal"] === true) {
                return $this->json(['message' => sprintf('Grand Final already exists for this tournament: %s', $data["tournament"])], 409);
            }

            $stage->setName($data["name"]);
            $stage->setIsFinal($data["isFinal"]);
            $stage->setIsGrandFinal($data["isGrandFinal"]);
            $stage->setTournament($tournament);

            $entityManager->persist($stage);
            $entityManager->flush();

            return $this->json(['message' => 'Successfully edited stage']);
        } else {
            return $this->json(
                [
                    'message' => sprintf('error on adding stage: %s', $requestValidator->getErrors()),
                ], 400
            );
        }
    }

    #[Route('/stage/{id<\d+>}', name: 'app_stage_delete', methods: ['DELETE', 'OPTIONS'])]
    public function deleteAction(
        $id,
        EntityManagerInterface $entityManager,
    ): JsonResponse
    {
        $stage = $entityManager->getRepository(Stage::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

        if(!$stage) {
            return $this->json(['message' => sprintf('Stage with ID %s not found', $id)], 404);
        }

        $stage->setIsDeleted(true);

        $entityManager->persist($stage);
        $entityManager->flush();

        return $this->json(['message' => 'Successfully deleted stage'], 204);
    }
}
