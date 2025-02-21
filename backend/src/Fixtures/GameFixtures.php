<?php

namespace App\Fixtures;

use App\Constants\GameEndings;
use App\Entity\Game;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class GameFixtures extends Fixture implements DependentFixtureInterface {
    public const GAME_REFERENCE = 'game-';

    public function load(ObjectManager $manager)
    {
        //Reference: game-1
        $game = new Game();
        $game->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $game->setIsDeleted(false);
        $game->setTeamHome($this->getReference(TeamFixtures::TEAM_REFERENCE . '1'));
        $game->setTeamGuest($this->getReference(TeamFixtures::TEAM_REFERENCE . '2'));
        $game->setStart(new DateTime("tomorrow"));
        $game->setStage($this->getReference(StageFixtures::STAGE_REFERENCE . '1'));
        $game->setGameEnd(null);
        $game->setScoreTeamHome(null);
        $game->setScoreTeamGuest(null);
        $manager->persist($game);
        $this->addReference(self::GAME_REFERENCE . '1', $game);

        //Reference: game-2
        $game = new Game();
        $game->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $game->setIsDeleted(false);
        $game->setTeamHome($this->getReference(TeamFixtures::TEAM_REFERENCE . '3'));
        $game->setTeamGuest($this->getReference(TeamFixtures::TEAM_REFERENCE . '4'));
        $game->setStart(new DateTime("yesterday"));
        $game->setStage($this->getReference(StageFixtures::STAGE_REFERENCE . '2'));
        $game->setGameEnd(GameEndings::GAME_ENDING_REGULAR);
        $game->setScoreTeamHome(1);
        $game->setScoreTeamGuest(2);
        $manager->persist($game);
        $this->addReference(self::GAME_REFERENCE . '2', $game);

        //Reference: game-3
        $game = new Game();
        $game->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $game->setIsDeleted(true);
        $game->setTeamHome($this->getReference(TeamFixtures::TEAM_REFERENCE . '1'));
        $game->setTeamGuest($this->getReference(TeamFixtures::TEAM_REFERENCE . '3'));
        $game->setStart(new DateTime("+1 week"));
        $game->setStage($this->getReference(StageFixtures::STAGE_REFERENCE . '1'));
        $game->setGameEnd(null);
        $game->setScoreTeamHome(null);
        $game->setScoreTeamGuest(null);
        $manager->persist($game);
        $this->addReference(self::GAME_REFERENCE . '3', $game);

        //Reference: game-4
        $game = new Game();
        $game->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '2'));
        $game->setIsDeleted(false);
        $game->setTeamHome($this->getReference(TeamFixtures::TEAM_REFERENCE . '1'));
        $game->setTeamGuest($this->getReference(TeamFixtures::TEAM_REFERENCE . '4'));
        $game->setStart(new DateTime("+3 days"));
        $game->setStage($this->getReference(StageFixtures::STAGE_REFERENCE . '6'));
        $game->setGameEnd(null);
        $game->setScoreTeamHome(null);
        $game->setScoreTeamGuest(null);
        $manager->persist($game);
        $this->addReference(self::GAME_REFERENCE . '4', $game);

        //Reference: game-5
        $game = new Game();
        $game->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $game->setIsDeleted(false);
        $game->setTeamHome($this->getReference(TeamFixtures::TEAM_REFERENCE . '2'));
        $game->setTeamGuest($this->getReference(TeamFixtures::TEAM_REFERENCE . '3'));
        $game->setStart(new DateTime("+4 days"));
        $game->setStage($this->getReference(StageFixtures::STAGE_REFERENCE . '5'));
        $game->setGameEnd(null);
        $game->setScoreTeamHome(null);
        $game->setScoreTeamGuest(null);
        $manager->persist($game);
        $this->addReference(self::GAME_REFERENCE . '5', $game);

        //Reference: game-6
        $game = new Game();
        $game->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $game->setIsDeleted(false);
        $game->setTeamHome($this->getReference(TeamFixtures::TEAM_REFERENCE . '3'));
        $game->setTeamGuest($this->getReference(TeamFixtures::TEAM_REFERENCE . '1'));
        $game->setStart(new DateTime("-2 days"));
        $game->setStage($this->getReference(StageFixtures::STAGE_REFERENCE . '1'));
        $game->setGameEnd(GameEndings::GAME_ENDING_OVERTIME);
        $game->setScoreTeamHome(4);
        $game->setScoreTeamGuest(3);
        $manager->persist($game);
        $this->addReference(self::GAME_REFERENCE . '6', $game);

        $manager->flush();
    }

    public function getDependencies()
    {
        return [
            TournamentFixtures::class,
            TeamFixtures::class,
            StageFixtures::class,
            UserFixtures::class
        ];
    }
}