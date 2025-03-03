<?php

namespace App\Validator;

use App\Constants\GameEndings;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class GameRequestValidator extends AbstractValidator
{
    protected ConstraintViolationListInterface $errors;

    public function validate(array $data, ValidatorInterface $validator): bool
    {
        $constraint = new Assert\Collection([
            'scoreTeamHome' => new Assert\Optional(new Assert\Range(['min' => 0, 'max' => 15])),
            'scoreTeamGuest' => new Assert\Optional(new Assert\Range(['min' => 0, 'max' => 15])),
            'gameEnd' => new Assert\Optional(new Assert\Choice(GameEndings::GAME_ENDINGS)),
            'start' => new Assert\DateTime("d.m.Y H:i"),
            'tournament' => new Assert\Positive(),
            'stage' => new Assert\Positive(),
            'teamHome' => new Assert\Positive(),
            'teamGuest' => new Assert\Positive(),
            'id' => new Assert\Optional(new Assert\Positive()),
        ]);

        $this->errors = $validator->validate($data, $constraint);

        return $this->errors->count() === 0;
    }

    public function getErrors(): string
    {
        return (string) $this->errors;
    }
}