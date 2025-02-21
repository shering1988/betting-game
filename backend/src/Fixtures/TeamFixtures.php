<?php

namespace App\Fixtures;

use App\Entity\Team;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TeamFixtures extends Fixture {
    public const TEAM_REFERENCE = 'team-';

    public function load(ObjectManager $manager)
    {
        //Reference: team-1
        $team = new Team();
        $team->setName('Germany');
        $team->setShortName('GER');
        $team->setIsDeleted(false);
        $manager->persist($team);
        $this->addReference(self::TEAM_REFERENCE . '1', $team);

        //Reference: team-2
        $team = new Team();
        $team->setName('France');
        $team->setShortName('FRA');
        $team->setIsDeleted(false);
        $manager->persist($team);
        $this->addReference(self::TEAM_REFERENCE . '2', $team);

        //Reference: team-3
        $team = new Team();
        $team->setName('Spain');
        $team->setShortName('ESP');
        $team->setIsDeleted(false);
        $manager->persist($team);
        $this->addReference(self::TEAM_REFERENCE . '3', $team);

        //Reference: team-4
        $team = new Team();
        $team->setName('Belgium');
        $team->setShortName('BEL');
        $team->setIsDeleted(false);
        $manager->persist($team);
        $this->addReference(self::TEAM_REFERENCE . '4', $team);

        //Reference: team-5
        $team = new Team();
        $team->setName('England');
        $team->setShortName('ENG');
        $team->setIsDeleted(true);
        $manager->persist($team);
        $this->addReference(self::TEAM_REFERENCE . '5', $team);

        $manager->flush();
    }
}