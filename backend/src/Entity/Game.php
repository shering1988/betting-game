<?php

namespace App\Entity;

use App\Repository\GameRepository;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: GameRepository::class)]
class Game
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["game_main",'reduced'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'games')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["game_main",'reduced'])]
    #[MaxDepth(2)]
    private Team $teamHome;

    #[ORM\ManyToOne(inversedBy: 'gamesGuest')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["game_main",'reduced'])]
    #[MaxDepth(2)]
    private Team $teamGuest;

    #[ORM\ManyToOne(inversedBy: 'games')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["game_main", 'reduced'])]
    #[MaxDepth(2)]
    private Stage $stage;

    #[ORM\ManyToOne(inversedBy: 'games')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["game_main", "reduced"])]
    #[MaxDepth(1)]
    private Tournament $tournament;

    #[ORM\Column(options: ["default" => false])]
    #[Groups("game_main")]
    private bool $isDeleted = false;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["game_main",'reduced'])]
    private DateTimeInterface $start;

    #[ORM\Column(nullable: true)]
    #[Groups(["game_main",'reduced'])]
    private ?int $scoreTeamHome = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["game_main",'reduced'])]
    private ?int $scoreTeamGuest = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["game_main",'reduced'])]
    private ?string $gameEnd = null;

    #[ORM\OneToMany(mappedBy: 'game', targetEntity: Bet::class)]
    #[Groups(["game_main", "team_main", "stage_main"])]
    #[MaxDepth(1)]
    private Collection $bets;

    public function __construct()
    {
        $this->bets = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTeamHome(): Team
    {
        return $this->teamHome;
    }

    public function setTeamHome(?Team $teamHome): self
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

    public function getStage(): Stage
    {
        return $this->stage;
    }

    public function setStage(Stage $stage): self
    {
        $this->stage = $stage;

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

    public function isDeleted(): bool
    {
        return $this->isDeleted;
    }

    public function setIsDeleted(bool $isDeleted): self
    {
        $this->isDeleted = $isDeleted;

        return $this;
    }

    public function getStart(): DateTimeInterface
    {
        return $this->start;
    }

    public function setStart(DateTimeInterface $start): self
    {
        $this->start = $start;

        return $this;
    }

    public function getScoreTeamHome(): ?int
    {
        return $this->scoreTeamHome;
    }

    public function setScoreTeamHome(?int $scoreTeamHome): self
    {
        $this->scoreTeamHome = $scoreTeamHome;

        return $this;
    }

    public function getScoreTeamGuest(): ?int
    {
        return $this->scoreTeamGuest;
    }

    public function setScoreTeamGuest(?int $scoreTeamGuest): self
    {
        $this->scoreTeamGuest = $scoreTeamGuest;

        return $this;
    }

    public function getGameEnd(): ?string
    {
        return $this->gameEnd;
    }

    public function setGameEnd(?string $gameEnd): self
    {
        $this->gameEnd = $gameEnd;

        return $this;
    }

    /**
     * @return Collection<int, Bet>
     */
    public function getBets(): Collection
    {
        return new ArrayCollection($this->bets->getValues());
    }

    public function addBet(Bet $bet): self
    {
        if (!$this->bets->contains($bet)) {
            $this->bets->add($bet);
            $bet->setGame($this);
        }

        return $this;
    }

    public function removeBet(Bet $bet): self
    {
        $this->bets->removeElement($bet);

        return $this;
    }
}
