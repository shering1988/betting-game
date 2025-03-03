<?php

namespace App\Fixtures;

use App\Entity\Stage;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class StageFixtures extends Fixture implements DependentFixtureInterface {
    public const STAGE_REFERENCE = 'stage-';

    public function load(ObjectManager $manager)
    {
        //Reference: stage-1
        $stage = new Stage();
        $stage->setName('Group A');
        $stage->setIsDeleted(false);
        $stage->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $stage->setIsFinal(false);
        $stage->setIsGrandFinal(false);
        $manager->persist($stage);
        $this->addReference(self::STAGE_REFERENCE . '1', $stage);

        //Reference: stage-2
        $stage = new Stage();
        $stage->setName('Group B');
        $stage->setIsDeleted(false);
        $stage->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $stage->setIsFinal(false);
        $stage->setIsGrandFinal(false);
        $manager->persist($stage);
        $this->addReference(self::STAGE_REFERENCE . '2', $stage);

        //Reference: stage-3
        $stage = new Stage();
        $stage->setName('Group C');
        $stage->setIsDeleted(true);
        $stage->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $stage->setIsFinal(false);
        $stage->setIsGrandFinal(false);
        $manager->persist($stage);
        $this->addReference(self::STAGE_REFERENCE . '3', $stage);

        //Reference: stage-4
        $stage = new Stage();
        $stage->setName('SemiFinal');
        $stage->setIsDeleted(false);
        $stage->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $stage->setIsFinal(true);
        $stage->setIsGrandFinal(false);
        $manager->persist($stage);
        $this->addReference(self::STAGE_REFERENCE . '4', $stage);

        //Reference: stage-5
        $stage = new Stage();
        $stage->setName('GrandFinal');
        $stage->setIsDeleted(false);
        $stage->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '1'));
        $stage->setIsFinal(false);
        $stage->setIsGrandFinal(true);
        $manager->persist($stage);
        $this->addReference(self::STAGE_REFERENCE . '5', $stage);

        //Reference: stage-6
        $stage = new Stage();
        $stage->setName('Group A');
        $stage->setIsDeleted(false);
        $stage->setTournament($this->getReference(TournamentFixtures::TOURNAMENT_REFERENCE . '2'));
        $stage->setIsFinal(false);
        $stage->setIsGrandFinal(false);
        $manager->persist($stage);
        $this->addReference(self::STAGE_REFERENCE . '6', $stage);

        $manager->flush();
    }

    public function getDependencies()
    {
        return [
            TournamentFixtures::class,
        ];
    }
}