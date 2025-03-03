<?php

namespace App\Entity;

use App\Repository\TournamentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;
use Symfony\Component\Validator\Constraints\DateTime;

#[ORM\Entity(repositoryClass: TournamentRepository::class)]
class Tournament
{
    #[Groups(["tournament_main",'reduced'])]
    private bool $hasTournamentStarted = false;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["tournament_main",'reduced'])]
    private ?int $id = null;

    #[ORM\Column(options: ["default" => false])]
    #[Groups("tournament_main")]
    private bool $isDeleted = false;

    #[ORM\Column(options: ["default" => false])]
    #[Groups(["tournament_main",'reduced'])]
    private bool $isActive = false;

    #[ORM\Column(length: 255, nullable: false)]
    #[Groups(["tournament_main",'reduced'])]
    private string $name;

    #[ORM\Column(nullable: false)]
    #[Groups("tournament_main")]
    private int $finalBetScore;

    #[ORM\Column(nullable: false)]
    #[Groups("tournament_main")]
    private int $correctBetScore;

    #[ORM\Column(nullable: false)]
    #[Groups("tournament_main")]
    private int $tendingBetScore;

    #[ORM\Column(nullable: false)]
    #[Groups("tournament_main")]
    private int $gameEndScore;

    #[ORM\OneToMany(mappedBy: 'tournament', targetEntity: Stage::class)]
    #[Groups("tournament_main")]
    #[MaxDepth(1)]
    private Collection $stages;

    #[ORM\OneToMany(mappedBy: 'tournament', targetEntity: Game::class)]
    #[Groups("tournament_main")]
    #[MaxDepth(1)]
    private Collection $games;

    public function __construct()
    {
        $this->stages = new ArrayCollection();
        $this->games = new ArrayCollection();
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

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): self
    {
        $this->isActive = $isActive;

        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getFinalBetScore(): int
    {
        return $this->finalBetScore;
    }

    public function setFinalBetScore(int $finalBetScore): self
    {
        $this->finalBetScore = $finalBetScore;

        return $this;
    }

    public function getCorrectBetScore(): int
    {
        return $this->correctBetScore;
    }

    public function setCorrectBetScore(int $correctBetScore): self
    {
        $this->correctBetScore = $correctBetScore;

        return $this;
    }

    public function getTendingBetScore(): int
    {
        return $this->tendingBetScore;
    }

    public function setTendingBetScore(int $tendingBetScore): self
    {
        $this->tendingBetScore = $tendingBetScore;

        return $this;
    }

    public function getGameEndScore(): int
    {
        return $this->gameEndScore;
    }

    public function setGameEndScore(int $gameEndScore): self
    {
        $this->gameEndScore = $gameEndScore;

        return $this;
    }

    /**
     * @return Collection<int, Stage>
     */
    public function getStages(): Collection
    {
        $returnStages = new ArrayCollection();
        foreach($this->stages as $stage) {
            if(!$stage->isDeleted()) {
                $returnStages->add($stage);
            }
        }
        return $returnStages;
    }

    public function addStage(Stage $stage): self
    {
        if (!$this->stages->contains($stage)) {
            $this->stages->add($stage);
            $stage->setTournament($this);
        }

        return $this;
    }

    public function removeStage(Stage $stage): self
    {
        if ($this->stages->removeElement($stage)) {
            // set the owning side to null (unless already changed)
            if ($stage->getTournament() === $this) {
                $stage->setTournament(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Game>
     */
    public function getGames(): Collection
    {
        $returnGames = new ArrayCollection();
        foreach($this->games as $game) {
            if(!$game->isDeleted()) {
                $returnGames->add($game);
            }
        }
        return $returnGames;
    }

    public function addGame(Game $game): self
    {
        if (!$this->games->contains($game)) {
            $this->games->add($game);
            $game->setTournament($this);
        }

        return $this;
    }

    public function removeGame(Game $game): self
    {
        if ($this->games->removeElement($game)) {
            // set the owning side to null (unless already changed)
            if ($game->getTournament() === $this) {
                $game->setTournament(null);
            }
        }

        return $this;
    }

    public function getHasTournamentStarted(): bool
    {
        $mostEarlyGame = null;
        /**
         * @var Game $game
         */
        foreach($this->games as $game) {
            if($mostEarlyGame === null) {
                $mostEarlyGame = $game;
                continue;
            }

            if($game->getStart() < $mostEarlyGame->getStart()) {
                $mostEarlyGame = $game;
            }
        }

        if($mostEarlyGame) {
            $now = new \DateTime("now");

            if($now > $mostEarlyGame->getStart()) {
                return true;
            }
        }

        return false;
    }
}
