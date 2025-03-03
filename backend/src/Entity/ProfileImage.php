<?php

namespace App\Entity;

use App\Repository\ProfileImageRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: ProfileImageRepository::class)]
class ProfileImage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["main","reduced"])]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'profileImage', cascade: ['persist', 'remove'])]
    #[MaxDepth(1)]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    #[Groups(["main","reduced"])]
    private ?string $path = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(string $path): self
    {
        $this->path = $path;

        return $this;
    }
}
