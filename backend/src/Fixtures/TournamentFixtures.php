<?php

namespace App\Fixtures;

use App\Entity\Tournament;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TournamentFixtures extends Fixture {
    public const TOURNAMENT_REFERENCE = 'tournament-';

    public function load(ObjectManager $manager)
    {
        //Reference: tournament-1
        $tournament = new Tournament();
        $tournament->setName('ActiveTournament');
        $tournament->setIsActive(true);
        $tournament->setIsDeleted(false);
        $tournament->setGameEndScore(1);
        $tournament->setTendingBetScore(1);
        $tournament->setCorrectBetScore(3);
        $tournament->setFinalBetScore(5);
        $manager->persist($tournament);
        $this->addReference(self::TOURNAMENT_REFERENCE . '1', $tournament);

        //Reference: tournament-2
        $tournament = new Tournament();
        $tournament->setName('InActiveTournament');
        $tournament->setIsActive(false);
        $tournament->setIsDeleted(false);
        $tournament->setGameEndScore(1);
        $tournament->setTendingBetScore(1);
        $tournament->setCorrectBetScore(3);
        $tournament->setFinalBetScore(5);
        $manager->persist($tournament);
        $this->addReference(self::TOURNAMENT_REFERENCE . '2', $tournament);

        //Reference: tournament-3
        $tournament = new Tournament();
        $tournament->setName('InActiveTournament');
        $tournament->setIsActive(false);
        $tournament->setIsDeleted(true);
        $tournament->setGameEndScore(1);
        $tournament->setTendingBetScore(1);
        $tournament->setCorrectBetScore(3);
        $tournament->setFinalBetScore(5);
        $manager->persist($tournament);
        $this->addReference(self::TOURNAMENT_REFERENCE . '3', $tournament);

        $manager->flush();
    }
}