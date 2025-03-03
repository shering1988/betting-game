<?php

namespace App\Entity;

use App\Repository\StageRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: StageRepository::class)]
class Stage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["stage_main",'reduced'])]
    private ?int $id = null;

    #[ORM\Column(options: ["default" => false])]
    #[Groups("stage_main")]
    private bool $isDeleted = false;

    #[ORM\Column(length: 255, nullable: false)]
    #[Groups(["stage_main",'reduced'])]
    private string $name;

    #[ORM\ManyToOne(inversedBy: 'stages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups("stage_main")]
    #[MaxDepth(1)]
    private Tournament $tournament;

    #[ORM\Column]
    #[Groups(["stage_main",'reduced'])]
    private bool $isFinal = false;

    #[ORM\Column]
    #[Groups(["stage_main",'reduced'])]
    private bool $isGrandFinal = false;

    #[ORM\OneToMany(mappedBy: 'stage', targetEntity: Game::class)]
    #[Groups("stage_main")]
    #[MaxDepth(1)]
    private Collection $games;

    public function __construct()
    {
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

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getTournament(): Tournament
    {
        return $this->tournament;
    }

    public function setTournament(Tournament $Tournament): self
    {
        $this->tournament = $Tournament;

        return $this;
    }

    public function isFinal(): ?bool
    {
        return $this->isFinal;
    }

    public function setIsFinal(bool $isFinal): self
    {
        $this->isFinal = $isFinal;

        return $this;
    }

    public function isGrandFinal(): ?bool
    {
        return $this->isGrandFinal;
    }

    public function setIsGrandFinal(bool $isGrandFinal): self
    {
        $this->isGrandFinal = $isGrandFinal;

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
            $game->setStage($this);
        }

        return $this;
    }

    public function removeGame(Game $game): self
    {
        if ($this->games->removeElement($game)) {
            // set the owning side to null (unless already changed)
            if ($game->getStage() === $this) {
                $game->setStage(null);
            }
        }

        return $this;
    }
}
