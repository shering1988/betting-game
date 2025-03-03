<?php

namespace App\Validator;

use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class StageRequestValidator extends AbstractValidator
{
    protected ConstraintViolationListInterface $errors;

    public function validate(array $data, ValidatorInterface $validator): bool
    {
        $constraint = new Assert\Collection([
            'name' => [new Assert\Length([], 3, 100), new Assert\Regex('/[a-zA-Z0-9_\-\.\+\#]*/')],
            'isFinal' => new Assert\Type('boolean'),
            'isGrandFinal' => new Assert\Type('boolean'),
            'tournament' => new Assert\Positive(),
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