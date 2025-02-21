<?php

namespace App\Entity;

use App\Constants\GameEndings;
use App\Repository\BetRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity(repositoryClass: BetRepository::class)]
class Bet
{
    #[Groups(["bet_main",'reduced'])]
    private array $score = [];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["bet_main",'reduced'])]
    private ?int $id = null;

    #[ORM\Column(options: ["default" => false])]
    #[Groups("bet_main")]
    private bool $isDeleted = false;

    #[ORM\ManyToOne(inversedBy: 'bets')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["bet_main",'reduced'])]
    #[MaxDepth(1)]
    private Game $game;

    #[ORM\ManyToOne(inversedBy: 'bets')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["bet_main", "reduced"])]
    #[MaxDepth(1)]
    private User $user;

    #[ORM\Column]
    #[Groups(["bet_main",'reduced'])]
    private int $teamHomeScore;

    #[ORM\Column]
    #[Groups(["bet_main",'reduced'])]
    private int $teamGuestScore;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["bet_main",'reduced'])]
    private ?string $gameEnd = null;

    public function getScore(): array
    {
        $this->score["goal_result"] = $this->getGoalResult();
        $this->score["game_end_result"] = $this->getGameEndResult();
        $this->score["score"] = 0;

        switch($this->getGoalResult()) {
            case GameEndings::ENDING_CORRECT:
                $this->score["score"] += $this->getGame()->getTournament()->getCorrectBetScore();
                break;
            case GameEndings::ENDING_TENDING:
                $this->score["score"] += $this->getGame()->getTournament()->getTendingBetScore();
                break;
        }

        if($this->getGame()->getStage()->isGrandFinal() || $this->getGame()->getStage()->isFinal()) {
            switch ($this->getGameEndResult()) {
                case GameEndings::ENDING_CORRECT:
                    $this->score["score"] += $this->getGame()->getTournament()->getGameEndScore();
                    break;
                default:
                    break;
            }
        }

        return $this->score;
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

    public function getGame(): Game
    {
        return $this->game;
    }

    public function setGame(Game $game): self
    {
        $this->game = $game;

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

    public function getTeamHomeScore(): int
    {
        return $this->teamHomeScore;
    }

    public function setTeamHomeScore(int $teamHomeScore): self
    {
        $this->teamHomeScore = $teamHomeScore;

        return $this;
    }

    public function getTeamGuestScore(): int
    {
        return $this->teamGuestScore;
    }

    public function setTeamGuestScore(int $teamGuestScore): self
    {
        $this->teamGuestScore = $teamGuestScore;

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

    public function getGameEndResult(): ?string
    {
        if($this->getGame()->getGameEnd() === null) {
            return null;
        }

        if($this->getGameEnd() === $this->getGame()->getGameEnd()) {
            return GameEndings::ENDING_CORRECT;
        } else {
            return GameEndings::ENDING_INCORRECT;
        }
    }

    public function getGoalResult(): ?string
    {
        if($this->getGame()->getGameEnd() === null) {
            return null;
        }

        if(
            $this->getTeamHomeScore() == $this->getGame()->getScoreTeamHome() &&
            $this->getTeamGuestScore() == $this->getGame()->getScoreTeamGuest()
        ) {
            return GameEndings::ENDING_CORRECT;
        } else {
            if(
                $this->getGame()->getScoreTeamHome() > $this->getGame()->getScoreTeamGuest() &&
                $this->getTeamHomeScore() > $this->getTeamGuestScore()
            ) {
                return GameEndings::ENDING_TENDING;
            }
            if(
                $this->getGame()->getScoreTeamHome() < $this->getGame()->getScoreTeamGuest() &&
                $this->getTeamHomeScore() < $this->getTeamGuestScore()
            ) {
                return GameEndings::ENDING_TENDING;
            }
            if(
                $this->getGame()->getScoreTeamHome() == $this->getGame()->getScoreTeamGuest() &&
                $this->getTeamHomeScore() == $this->getTeamGuestScore()
            ) {
                return GameEndings::ENDING_TENDING;
            }
        }
        return GameEndings::ENDING_INCORRECT;
    }
}
