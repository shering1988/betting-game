<?php

namespace App\Validator;

use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class RegistrationRequestValidator extends AbstractValidator
{
    protected ConstraintViolationListInterface $errors;

    public function validate(array $data, ValidatorInterface $validator): bool
    {
        $constraint = new Assert\Collection([
            'email' => new Assert\Email(),
            'name' => [new Assert\Length([], 3, 20), new Assert\Regex('/[a-zA-Z0-9_\-\.\+\#]*/')],
            'password' => [new Assert\Length([], 8, 100), new Assert\Regex('/^(?=.*[A-Z])(?=.*[!@#$&*.-_?+=])(?=.*[0-9])(?=.*[a-z]).{8,}$/')],
            'passwordRepeat' => [new Assert\Length([], 8, 100), new Assert\Regex('/^(?=.*[A-Z])(?=.*[!@#$&*.-_?+=])(?=.*[0-9])(?=.*[a-z]).{8,}$/')],
            'reminder' => new Assert\Type('boolean'),
            'secret' => new Assert\Type('string'),
        ]);

        $this->errors = $validator->validate($data, $constraint);

        return $this->errors->count() === 0;
    }

    public function getErrors(): string
    {
        return (string) $this->errors;
    }
}