<?php

namespace App\Controller;

use App\Entity\Game;
use App\Entity\Stage;
use App\Entity\Team;
use App\Entity\Tournament;
use App\Validator\GameRequestValidator;
use DateTime;
use DateTimeZone;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class GameController extends AbstractController
{
    #[Route('/tournament/{tournament<\d+>}/game/{id<\d+>?}', name: 'app_game_get', methods: ['GET', 'OPTIONS'])]
    public function indexAction(Request $request, int $tournament, ?int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        if($id) {
            $games = $entityManager->getRepository(Game::class)->findOneBy(['isDeleted' => false, 'id' => $id, 'tournament' => $tournament]);

            if(!$games) {
                return $this->json(['message' => sprintf('Game with ID %s not found', $id)], 404);
            }

            $games = [$games];
        } else {
            $games = $entityManager->getRepository(Game::class)->findBy(['isDeleted' => false, 'tournament' => $tournament]);
        }

        foreach($games as $gameKey => $game) {
            foreach($game->getBets() as $bet) {
                if($game->getStart() > new DateTime()) {
                    if(!in_array('ROLE_ADMIN', $this->getUser()->getRoles()) && $bet->getUser()->getId() !== $this->getUser()->getId()) {
                        $game->removeBet($bet);
                    }
                }
                if($bet->isDeleted()) {
                    $game->removeBet($bet);
                }
            }
            try {
                if($game->getStage()->isDeleted() || $game->getTournament()->isDeleted()) {
                    unset($games[$gameKey]);
                }
            } catch(EntityNotFoundException $exception) {
                unset($games[$gameKey]);
            }
        }

        $games = array_values($games);

        return $this->json($games, 200, [], [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
            'groups' => ['game_main', 'reduced'],
            AbstractNormalizer::CIRCULAR_REFERENCE_LIMIT => 2,
            AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true
        ]);
    }

    #[Route('/game', name: 'app_game_put', methods: ['PUT', 'OPTIONS'])]
    public function putAction(
        Request $request,
        EntityManagerInterface $entityManager,
        GameRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $data["tournament"]]);
            $stage = $entityManager->getRepository(Stage::class)->findOneBy(['isDeleted' => false, 'id' => $data["stage"]]);
            $teamHome = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $data["teamHome"]]);
            $teamGuest = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $data["teamGuest"]]);

            if(!$tournament) {
                return $this->json(['message' => sprintf('No valid tournament provided: %s', $data["tournament"])], 400);
            }
            if(!$stage) {
                return $this->json(['message' => sprintf('No valid stage provided: %s', $data["stage"])], 400);
            }
            if(!$teamHome) {
                return $this->json(['message' => sprintf('No valid home team provided: %s', $data["teamHome"])], 400);
            }
            if(!$teamGuest) {
                return $this->json(['message' => sprintf('No valid guest team provided: %s', $data["teamGuest"])], 400);
            }

            $game = new Game();

            $game->setStage($stage);
            $game->setTeamGuest($teamGuest);
            $game->setTeamHome($teamHome);
            $game->setTournament($tournament);
            $game->setStart(DateTime::createFromFormat("d.m.Y H:i", $data["start"], new DateTimeZone("Europe/Berlin")));

            if(array_key_exists("gameEnd", $data)) {
                $game->setGameEnd($data["gameEnd"]);
            }
            if(array_key_exists("scoreTeamGuest", $data)) {
                $game->setScoreTeamGuest($data["scoreTeamGuest"]);
            }
            if(array_key_exists("scoreTeamHome", $data)) {
                $game->setScoreTeamHome($data["scoreTeamHome"]);
            }

            $entityManager->persist($game);
            $entityManager->flush();

            return $this->json(
                [
                    'message' => 'Successfully added game',
                    'resource' => $this->generateUrl('app_game_get', ['tournament' => $tournament->getId(), 'id' => $game->getId()], UrlGeneratorInterface::ABSOLUTE_URL)
                ], 201
            );
        } else {
            return $this->json(['message' => sprintf('error on adding game: %s', $requestValidator->getErrors())], 400);
        }
    }

    #[Route('/game/{id<\d+>}', name: 'app_game_post', methods: ['POST', 'OPTIONS'])]
    public function postAction(
        $id,
        Request $request,
        EntityManagerInterface $entityManager,
        GameRequestValidator $requestValidator,
        ValidatorInterface $validator
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if($requestValidator->validate($data, $validator)) {
            $game = $entityManager->getRepository(Game::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

            if(!$game) {
                return $this->json(['message' => sprintf('Game with ID %s not found', $id)], 404);
            }

            $tournament = $entityManager->getRepository(Tournament::class)->findOneBy(['isDeleted' => false, 'id' => $data["tournament"]]);
            $stage = $entityManager->getRepository(Stage::class)->findOneBy(['isDeleted' => false, 'id' => $data["stage"]]);
            $teamHome = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $data["teamHome"]]);
            $teamGuest = $entityManager->getRepository(Team::class)->findOneBy(['isDeleted' => false, 'id' => $data["teamGuest"]]);

            if(!$tournament) {
                return $this->json(['message' => sprintf('No valid tournament provided: %s', $data["tournament"])], 400);
            }
            if(!$stage) {
                return $this->json(['message' => sprintf('No valid stage provided: %s', $data["stage"])], 400);
            }
            if(!$teamHome) {
                return $this->json(['message' => sprintf('No valid home team provided: %s', $data["teamHome"])], 400);
            }
            if(!$teamGuest) {
                return $this->json(['message' => sprintf('No valid guest team provided: %s', $data["teamGuest"])], 400);
            }

            $game->setStage($stage);
            $game->setTeamGuest($teamGuest);
            $game->setTeamHome($teamHome);
            $game->setTournament($tournament);
            $game->setStart(DateTime::createFromFormat("d.m.Y H:i", $data["start"], new DateTimeZone("Europe/Berlin")));

            if(array_key_exists("gameEnd", $data)) {
                $game->setGameEnd($data["gameEnd"]);
            }
            if(array_key_exists("scoreTeamGuest", $data)) {
                $game->setScoreTeamGuest($data["scoreTeamGuest"]);
            }
            if(array_key_exists("scoreTeamHome", $data)) {
                $game->setScoreTeamHome($data["scoreTeamHome"]);
            }

            $entityManager->persist($game);
            $entityManager->flush();

            return $this->json(['message' => 'Successfully edited game']);
        } else {
            return $this->json(
                [
                    'message' => sprintf('error on adding game: %s', $requestValidator->getErrors()),
                ], 400
            );
        }
    }

    #[Route('/game/{id<\d+>}', name: 'app_game_delete', methods: ['DELETE', 'OPTIONS'])]
    public function deleteAction(
        $id,
        EntityManagerInterface $entityManager,
    ): JsonResponse
    {
        $game = $entityManager->getRepository(Game::class)->findOneBy(['isDeleted' => false, 'id' => $id]);

        if(!$game) {
            return $this->json(['message' => sprintf('Game with ID %s not found', $id)], 404);
        }

        $game->setIsDeleted(true);

        $entityManager->persist($game);
        $entityManager->flush();

        return $this->json(['message' => 'Successfully deleted game'], 204);
    }
}
