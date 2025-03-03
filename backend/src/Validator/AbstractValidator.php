<?php

namespace App\Validator;

use Symfony\Component\Validator\Validator\ValidatorInterface;

abstract class AbstractValidator {
    abstract public function validate(array $data, ValidatorInterface $validator): bool;

    abstract public function getErrors(): string;
}