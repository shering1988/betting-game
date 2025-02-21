<?php

namespace App\Entity;

use App\Repository\TeamRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: TeamRepository::class)]
class Team
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["team_main",'reduced'])]
    private ?int $id = null;

    #[ORM\Column(options: ["default" => false])]
    #[Groups("team_main")]
    private bool $isDeleted = false;

    #[ORM\Column(length: 255, nullable: false)]
    #[Groups(["team_main",'reduced'])]
    private string $name;

    #[ORM\Column(length: 255, nullable: false)]
    #[Groups(["team_main",'reduced'])]
    private string $shortName;

    #[ORM\OneToMany(mappedBy: 'teamHome', targetEntity: Game::class)]
    #[Groups("team_main")]
    #[MaxDepth(1)]
    private Collection $games;

    #[ORM\OneToMany(mappedBy: 'teamGuest', targetEntity: Game::class)]
    #[MaxDepth(1)]
    private Collection $gamesGuest;

    public function __construct()
    {
        $this->games = new ArrayCollection();
        $this->gamesGuest = new ArrayCollection();
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

    public function getShortName(): string
    {
        return $this->shortName;
    }

    public function setShortName(string $shortName): self
    {
        $this->shortName = $shortName;

        return $this;
    }

    /**
     * @return Collection<int, Game>
     */
    public function getGames(): Collection
    {
        $bufferGames = new ArrayCollection(array_merge($this->games->toArray(), $this->gamesGuest->toArray()));
        $returnGames = new ArrayCollection();
        foreach($bufferGames as $game) {
            if(!$game->isDeleted()) {
                $returnGames->add($game);
            }
        }
        return $returnGames;
    }
}
