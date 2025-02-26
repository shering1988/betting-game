<?php

namespace App\Security;

use App\Entity\User as AppUser;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user, ): void
    {
        if (!$user instanceof AppUser) {
            return;
        }

        if (!$user->isEnabled() || !$user->isVerified()) {
            throw new CustomUserMessageAccountStatusException('user not enabled or verified');
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
        // no check here
    }
}