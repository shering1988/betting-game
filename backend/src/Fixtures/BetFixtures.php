<?php

namespace App\Fixtures;

use App\Constants\GameEndings;
use App\Entity\Bet;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class BetFixtures extends Fixture implements DependentFixtureInterface {
    public const BET_REFERENCE = 'bet-';

    public function load(ObjectManager $manager)
    {
        //Reference: bet-1
        $bet = new Bet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '1'));
        $bet->setIsDeleted(false);
        $bet->setGameEnd(null);
        $bet->setGame($this->getReference(GameFixtures::GAME_REFERENCE . '1'));
        $bet->setTeamGuestScore(2);
        $bet->setTeamHomeScore(1);
        $manager->persist($bet);
        $this->addReference(self::BET_REFERENCE . '1', $bet);

        //Reference: bet-2
        $bet = new Bet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '5'));
        $bet->setIsDeleted(false);
        $bet->setGameEnd(null);
        $bet->setGame($this->getReference(GameFixtures::GAME_REFERENCE . '1'));
        $bet->setTeamGuestScore(2);
        $bet->setTeamHomeScore(4);
        $manager->persist($bet);
        $this->addReference(self::BET_REFERENCE . '2', $bet);

        //Reference: bet-3
        $bet = new Bet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '5'));
        $bet->setIsDeleted(true);
        $bet->setGameEnd(null);
        $bet->setGame($this->getReference(GameFixtures::GAME_REFERENCE . '1'));
        $bet->setTeamGuestScore(2);
        $bet->setTeamHomeScore(4);
        $manager->persist($bet);
        $this->addReference(self::BET_REFERENCE . '3', $bet);

        //Reference: bet-4
        $bet = new Bet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '1'));
        $bet->setIsDeleted(false);
        $bet->setGameEnd(null);
        $bet->setGame($this->getReference(GameFixtures::GAME_REFERENCE . '2'));
        $bet->setTeamGuestScore(1);
        $bet->setTeamHomeScore(0);
        $manager->persist($bet);
        $this->addReference(self::BET_REFERENCE . '4', $bet);

        //Reference: bet-5
        $bet = new Bet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '5'));
        $bet->setIsDeleted(false);
        $bet->setGameEnd(null);
        $bet->setGame($this->getReference(GameFixtures::GAME_REFERENCE . '2'));
        $bet->setTeamGuestScore(2);
        $bet->setTeamHomeScore(1);
        $manager->persist($bet);
        $this->addReference(self::BET_REFERENCE . '5', $bet);

        //Reference: bet-6
        $bet = new Bet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '1'));
        $bet->setIsDeleted(false);
        $bet->setGameEnd(GameEndings::GAME_ENDING_PENALTY);
        $bet->setGame($this->getReference(GameFixtures::GAME_REFERENCE . '5'));
        $bet->setTeamGuestScore(2);
        $bet->setTeamHomeScore(1);
        $manager->persist($bet);
        $this->addReference(self::BET_REFERENCE . '6', $bet);

        //Reference: bet-7
        $bet = new Bet();
        $bet->setUser($this->getReference(UserFixtures::USER_REFERENCE . '5'));
        $bet->setIsDeleted(false);
        $bet->setGameEnd(GameEndings::GAME_ENDING_OVERTIME);
        $bet->setGame($this->getReference(GameFixtures::GAME_REFERENCE . '6'));
        $bet->setTeamGuestScore(2);
        $bet->setTeamHomeScore(1);
        $manager->persist($bet);
        $this->addReference(self::BET_REFERENCE . '7', $bet);

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