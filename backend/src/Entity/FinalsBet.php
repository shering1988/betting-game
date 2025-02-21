<?php

namespace App\Entity;

use App\Repository\FinalsBetRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: FinalsBetRepository::class)]
#[ORM\HasLifecycleCallbacks]
class FinalsBet
{
    #[Groups(["finals_bet_main",'reduced'])]
    private array $score = [
        'correct' => 0,
        'points' => 0
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["finals_bet_main", "reduced"])]
    private ?int $id = null;

    #[ORM\Column(options: ["default" => false])]
    #[Groups("finals_bet_main")]
    private bool $isDeleted = false;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["finals_bet_main", "reduced"])]
    #[MaxDepth(1)]
    private Team $teamHome;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["finals_bet_main", "reduced"])]
    #[MaxDepth(1)]
    private Team $teamGuest;

    #[ORM\ManyToOne(cascade: ['persist', 'remove'], inversedBy: 'finalsBet')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["finals_bet_main", "reduced"])]
    #[MaxDepth(1)]
    private User $user;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[MaxDepth(1)]
    #[Groups(["finals_bet_main", "reduced"])]
    private Tournament $tournament;


    #[Groups(["finals_bet_main", "reduced"])]
    private bool $isTeamHomeEliminated;

    #[Groups(["finals_bet_main", "reduced"])]
    private bool $isTeamGuestEliminated;

    #[ORM\PostLoad]
    public function setFinalsBetScore(LifecycleEventArgs $args) {
        $finalGame = null;
        $games = $args->getObjectManager()->getRepository(Game::class)->findBy(["tournament" => $this->getTournament()]);
        foreach($games as $game) {
            if($game->getStage()->isGrandFinal()) {
                $finalGame = $game;
                break;
            }
        }

        if($finalGame) {
            if (
                $finalGame->getTeamHome() === $this->getTeamHome() ||
                $finalGame->getTeamGuest() === $this->getTeamHome()
            ) {
                $this->setScore(
                    [
                        'correct' => $this->getScore()['correct'] + 1,
                        'points' => $this->getScore()['points'] + $this->getTournament()->getFinalBetScore()
                    ]
                );
            }

            if (
                $finalGame->getTeamHome() === $this->getTeamGuest() ||
                $finalGame->getTeamGuest() === $this->getTeamGuest()
            ) {
                $this->setScore(
                    [
                        'correct' => $this->getScore()['correct'] + 1,
                        'points' => $this->getScore()['points'] + $this->getTournament()->getFinalBetScore()
                    ]
                );
            }
        }
    }

    public function getScore(): array
    {
        return $this->score;
    }

    public function setScore(array $score): self
    {
        $this->score = $score;

        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isDeleted(): bool
    {
        return $this->isDeleted;
    }

    public function setIsDeleted(bool $isDeleted): self
    {
        $this->isDeleted = $isDeleted;

        return $this;
    }

    public function getTeamHome(): Team
    {
        return $this->teamHome;
    }

    public function setTeamHome(Team $teamHome): self
    {
        $this->teamHome = $teamHome;

        return $this;
    }

    public function getTeamGuest(): Team
    {
        return $this->teamGuest;
    }

    public function setTeamGuest(Team $teamGuest): self
    {
        $this->teamGuest = $teamGuest;

        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getTournament(): Tournament
    {
        return $this->tournament;
    }

    public function setTournament(Tournament $tournament): self
    {
        $this->tournament = $tournament;

        return $this;
    }

    public function getIsTeamHomeEliminated(): bool
    {
        return $this->isTeamHomeEliminated;
    }

    public function setIsTeamHomeEliminated(bool $isEliminated): self
    {
        $this->isTeamHomeEliminated = $isEliminated;

        return $this;
    }

    public function getIsTeamGuestEliminated(): bool
    {
        return $this->isTeamGuestEliminated;
    }

    public function setIsTeamGuestEliminated(bool $isEliminated): self
    {
        $this->isTeamGuestEliminated = $isEliminated;

        return $this;
    }
}
