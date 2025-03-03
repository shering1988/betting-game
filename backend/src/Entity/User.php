<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["user_main",'reduced'])]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private string $email;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private string $password;

    #[ORM\Column]
    #[Groups(["user_main",'reduced'])]
    private string $name;

    #[ORM\Column]
    #[Groups(["user_main"])]
    private bool $isEnabled;

    #[ORM\Column]
    private ?bool $sendReminder = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: FinalsBet::class)]
    #[Groups("user_main")]
    #[MaxDepth(1)]
    private Collection $finalsBets;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Bet::class)]
    #[Groups("user_main")]
    #[MaxDepth(1)]
    private Collection $bets;

    #[ORM\Column(type: 'boolean')]
    private bool $isVerified = false;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    #[Groups(["user_main",'reduced'])]
    #[MaxDepth(1)]
    private ?ProfileImage $profileImage = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

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

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function isEnabled(): ?bool
    {
        return $this->isEnabled;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function isSendReminder(): ?bool
    {
        return $this->sendReminder;
    }

    public function setSendReminder(bool $sendReminder): self
    {
        $this->sendReminder = $sendReminder;

        return $this;
    }

    /**
     * @return Collection
     */
    public function getFinalsBets(): Collection
    {
        $returnBets = new ArrayCollection();
        foreach($this->finalsBets as $bet) {
            if(!$bet->isDeleted()) {
                $returnBets->add($bet);
            }
        }
        return $returnBets;
    }

    public function addFinalsBet(FinalsBet $finalsBet): self
    {
        if (!$this->finalsBets->contains($finalsBet)) {
            $this->finalsBets->add($finalsBet);
            $finalsBet->setUser($this);
        }

        return $this;
    }

    public function removeFinalsBet(FinalsBet $finalsBet): self
    {
        $this->finalsBets->removeElement($finalsBet);

        return $this;
    }

    /**
     * @return Collection
     */
    public function getBets(): Collection
    {
        $returnBets = new ArrayCollection();
        foreach($this->bets as $bet) {
            if(!$bet->isDeleted()) {
                $returnBets->add($bet);
            }
        }
        return $returnBets;
    }

    public function addBet(Bet $bet): self
    {
        if (!$this->bets->contains($bet)) {
            $this->bets->add($bet);
            $bet->setUser($this);
        }

        return $this;
    }

    public function removeBet(Bet $bet): self
    {
        $this->bets->removeElement($bet);

        return $this;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): self
    {
        $this->isVerified = $isVerified;

        return $this;
    }

    public function getProfileImage(): ?ProfileImage
    {
        return $this->profileImage;
    }

    public function setProfileImage(?ProfileImage $profileImage): self
    {
        // unset the owning side of the relation if necessary
        if ($profileImage === null && $this->profileImage !== null) {
            $this->profileImage->setUser(null);
        }

        // set the owning side of the relation if necessary
        if ($profileImage !== null && $profileImage->getUser() !== $this) {
            $profileImage->setUser($this);
        }

        $this->profileImage = $profileImage;

        return $this;
    }
}
