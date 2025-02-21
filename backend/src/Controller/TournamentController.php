<?php

namespace App\Controller;

use App\Entity\Tournament;
use App\Validator\TournamentRequestValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class TournamentController extends AbstractController
{
    #[Route('/tournament/active', name: 'app_tournament_get_active', methods: ['GET', 'OPTIONS'])]
    public function activeAction(EntityManagerInterface $entityManager): JsonResponse
    {
        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'isActive' => true]);

        if(!$tournament) {
            return $this->json(['message' => 'No active tournament found'], 404);
        }

        return $this->json($tournament, 200, [], [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
            'groups' => ['tournament_main', 'reduced'],
            AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true
        ]);
    }

    #[Route('/tournament/{id<\d+>?}', name: 'app_tournament_get', methods: ['GET', 'OPTIONS'])]
    public function indexAction(?int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        if($id) {
            $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

            if(!$tournament) {
                return $this->json(['message' => sprintf('Tournament with ID %s not found', $id)], 404);
            }

            $tournaments = [$entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $id])];
        } else {
            $tournaments = $entityManager->getRepository(Tournament::class)->findBy(['isDeleted' => false]);
        }

        return $this->json($tournaments, 200, [], [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
            'groups' => ['tournament_main', 'reduced'],
            AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true
        ]);
    }

    #[Route('/tournament', name: 'app_tournament_put', methods: ['PUT', 'OPTIONS'])]
    public function putAction(
        Request $request,
        EntityManagerInterface $entityManager,
        TournamentRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $tournament = new Tournament();

            $tournament->setName($data["name"]);
            $tournament->setFinalBetScore($data["finalBetScore"]);
            $tournament->setCorrectBetScore($data["correctBetScore"]);
            $tournament->setTendingBetScore($data["tendingBetScore"]);
            $tournament->setGameEndScore($data["gameEndScore"]);
            $tournament->setIsActive($data["isActive"]);

            $entityManager->persist($tournament);
            $entityManager->flush();

            if($data["isActive"]) {
                $tournaments = $entityManager->getRepository(Tournament::class)->findBy(['isDeleted' => false]);
                /**
                 * @var Tournament $bufferTournament
                 */
                foreach($tournaments as $bufferTournament) {
                    if($tournament->getId() === $bufferTournament->getId()) {
                        continue;
                    }

                    $bufferTournament->setIsActive(false);

                    $entityManager->persist($bufferTournament);
                    $entityManager->flush();
                }
            }

            return $this->json(
                [
                    'message' => 'Successfully added tournament',
                    'resource' => $this->generateUrl('app_tournament_get', ['id' => $tournament->getId()], UrlGeneratorInterface::ABSOLUTE_URL)
                ], 201
            );
        } else {
            return $this->json(['message' => sprintf('error on adding tournament: %s', $requestValidator->getErrors())], 400);
        }
    }

    #[Route('/tournament/{id<\d+>}', name: 'app_tournament_post', methods: ['POST', 'OPTIONS'])]
    public function postAction(
        $id,
        Request $request,
        EntityManagerInterface $entityManager,
        TournamentRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

            if(!$tournament) {
                return $this->json(['message' => sprintf('Tournament with ID %s not found', $id)], 404);
            }

            $tournament->setName($data["name"]);
            $tournament->setFinalBetScore($data["finalBetScore"]);
            $tournament->setCorrectBetScore($data["correctBetScore"]);
            $tournament->setTendingBetScore($data["tendingBetScore"]);
            $tournament->setGameEndScore($data["gameEndScore"]);
            $tournament->setIsActive($data["isActive"]);

            $entityManager->persist($tournament);
            $entityManager->flush();

            if($data["isActive"]) {
                $tournaments = $entityManager->getRepository(Tournament::class)->findBy(['isDeleted' => false]);
                /**
                 * @var Tournament $bufferTournament
                 */
                foreach($tournaments as $bufferTournament) {
                    if($tournament->getId() === $bufferTournament->getId()) {
                        continue;
                    }

                    $bufferTournament->setIsActive(false);

                    $entityManager->persist($bufferTournament);
                    $entityManager->flush();
                }
            }

            return $this->json(['message' => 'Successfully edited tournament']);
        } else {
            return $this->json(
                [
                    'message' => sprintf('error on adding tournament: %s', $requestValidator->getErrors()),
                ], 400
            );
        }
    }

    #[Route('/tournament/{id<\d+>}', name: 'app_tournament_delete', methods: ['DELETE', 'OPTIONS'])]
    public function deleteAction(
        $id,
        EntityManagerInterface $entityManager,
    ): JsonResponse
    {
        $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

        if(!$tournament) {
            return $this->json(['message' => sprintf('Tournament with ID %s not found', $id)], 404);
        }

        if($tournament->isActive()) {
            return $this->json(['message' => sprintf('Not allowed to delete active tournament: %s', $id)], 409);
        }

        $tournament->setIsDeleted(true);

        $entityManager->persist($tournament);
        $entityManager->flush();

        return $this->json(['message' => 'Successfully deleted tournament'], 204);
    }
}
