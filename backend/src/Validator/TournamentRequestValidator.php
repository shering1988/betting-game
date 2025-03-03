<?php

namespace App\Validator;

use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class TournamentRequestValidator extends AbstractValidator
{
    protected ConstraintViolationListInterface $errors;

    public function validate(array $data, ValidatorInterface $validator): bool
    {
        $constraint = new Assert\Collection([
            'name' => [new Assert\Length([], 3, 100), new Assert\Regex('/[a-zA-Z0-9_\-\.\+\#]*/')],
            'isActive' => new Assert\Type('boolean'),
            'finalBetScore' => new Assert\PositiveOrZero(),
            'gameEndScore' => new Assert\PositiveOrZero(),
            'correctBetScore' => new Assert\PositiveOrZero(),
            'tendingBetScore' => new Assert\PositiveOrZero(),
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