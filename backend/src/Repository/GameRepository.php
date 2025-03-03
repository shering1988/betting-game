<?php

namespace App\Repository;

use App\Entity\Game;
use App\Entity\Tournament;
use DateInterval;
use DateTime;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Game>
 *
 * @method Game|null find($id, $lockMode = null, $lockVersion = null)
 * @method Game|null findOneBy(array $criteria, array $orderBy = null)
 * @method Game[]    findAll()
 * @method Game[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class GameRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Game::class);
    }

    public function save(Game $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Game $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findUpComingGames(Tournament $tournament): array
    {
        $from = new DateTime("now");
        $to   = new DateTime("now");
        $to->add(new DateInterval("PT1H"));

        return $this->createQueryBuilder('g')
            ->andWhere('g.start BETWEEN :from AND :to')
            ->andWhere('g.gameEnd IS NULL')
            ->andWhere('g.tournament = :tournament')
            ->andWhere('g.isDeleted = :deleted')
            ->setParameter('from', $from )
            ->setParameter('to', $to)
            ->setParameter('deleted', false)
            ->setParameter('tournament', $tournament->getId())
            ->getQuery()
            ->getResult();
   }

    public function findUpComingGroupStageGames(Tournament $tournament): array
    {
        $games = $this->createQueryBuilder('g')
            ->andWhere('g.gameEnd IS NULL')
            ->andWhere('g.tournament = :tournament')
            ->andWhere('g.isDeleted = :deleted')
            ->setParameter('deleted', false)
            ->setParameter('tournament', $tournament->getId())
            ->getQuery()
            ->getResult();

        /**
         * @var Game $game
         */
        return array_filter($games, function ($game) {
            if($game->getStage()->isFinal() || $game->getStage()->isGrandFinal()) {
                return false;
            }
            return true;
        });
    }

    public function findUpComingFinalStageGames(Tournament $tournament, bool $alwaysReturnGrandFinal): array
    {
        $games = $this->createQueryBuilder('g')
            ->andWhere('g.tournament = :tournament')
            ->andWhere('g.isDeleted = :deleted')
            ->setParameter('deleted', false)
            ->setParameter('tournament', $tournament->getId())
            ->getQuery()
            ->getResult();

        /**
         * @var Game $game
         */
        return array_filter($games, function ($game) use ($alwaysReturnGrandFinal) {
            if(!$game->getStage()->isFinal() && !$game->getStage()->isGrandFinal()) {
                return false;
            }

            if(!$alwaysReturnGrandFinal) {
                return $game->getGameEnd() === null;
            }

            if($game->getStage()->isGrandFinal()) {
                return true;
            }

            return $game->getGameEnd() === null;
        });
    }
}
