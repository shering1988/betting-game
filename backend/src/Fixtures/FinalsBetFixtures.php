<?php

namespace App\Fixtures;

use App\Entity\FinalsBet;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class FinalsBetFixtures extends Fixture implements DependentFixtureInterface {
    public const FINALS_BET_REFERENCE = 'finals-bet-';

    public function load(ObjectManager $manager)
    {
        //Reference: finals-bet-1
        $bet = new FinalsBet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '1'));
        $bet->setIsDeleted(false);
        $bet->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $bet->setTeamGuest($this->getReference(TeamFixtures::TEAM_REFERENCE . '1'));
        $bet->setTeamHome($this->getReference(TeamFixtures::TEAM_REFERENCE . '2'));
        $manager->persist($bet);
        $this->addReference(self::FINALS_BET_REFERENCE . '1', $bet);

        //Reference: finals-bet-2
        $bet = new FinalsBet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '5'));
        $bet->setIsDeleted(false);
        $bet->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $bet->setTeamGuest($this->getReference(TeamFixtures::TEAM_REFERENCE . '2'));
        $bet->setTeamHome($this->getReference(TeamFixtures::TEAM_REFERENCE . '3'));
        $manager->persist($bet);
        $this->addReference(self::FINALS_BET_REFERENCE . '2', $bet);

        //Reference: finals-bet-3
        $bet = new FinalsBet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '1'));
        $bet->setIsDeleted(true);
        $bet->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $bet->setTeamGuest($this->getReference(TeamFixtures::TEAM_REFERENCE . '2'));
        $bet->setTeamHome($this->getReference(TeamFixtures::TEAM_REFERENCE . '3'));
        $manager->persist($bet);
        $this->addReference(self::FINALS_BET_REFERENCE . '3', $bet);

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