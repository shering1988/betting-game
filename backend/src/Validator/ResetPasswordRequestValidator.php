<?php

namespace App\Validator;

use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class ResetPasswordRequestValidator extends AbstractValidator
{
    protected ConstraintViolationListInterface $errors;

    public function validate(array $data, ValidatorInterface $validator): bool
    {
        $constraint = new Assert\Collection([
            'email' => new Assert\Email(),
        ]);

        $this->errors = $validator->validate($data, $constraint);

        return $this->errors->count() === 0;
    }

    public function getErrors(): string
    {
        return (string) $this->errors;
    }
}