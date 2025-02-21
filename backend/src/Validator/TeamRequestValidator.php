<?php

namespace App\Validator;

use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class TeamRequestValidator extends AbstractValidator
{
    protected ConstraintViolationListInterface $errors;

    public function validate(array $data, ValidatorInterface $validator): bool
    {
        $constraint = new Assert\Collection([
            'name' => [new Assert\Length([], 3, 100), new Assert\Regex('/[a-zA-Z\x{00c4}\x{00e4}\x{00d6}\x{00f6}\x{00dc}\x{00fc}]*/')],
            'shortName' => [new Assert\Length([], 1, 3), new Assert\Regex('/[a-zA-Z]*/')],
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