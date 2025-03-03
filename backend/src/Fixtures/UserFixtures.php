<?php

namespace App\Fixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture {
    public const USER_REFERENCE = 'user-';

    private UserPasswordHasherInterface $hasher;

    public function __construct(UserPasswordHasherInterface $hasher)
    {
        $this->hasher = $hasher;
    }

    public function load(ObjectManager $manager)
    {
        //Reference: user-1
        $user = new User();
        $user->setName('RegularUser1');
        $user->setSendReminder(true);
        $user->setEmail('regularuser1@example.com');
        $user->setRoles(['ROLE_USER']);
        $user->setIsEnabled(true);
        $user->setIsVerified(true);
        $user->setPassword(
            $this->hasher->hashPassword($user, 'password1')
        );
        $manager->persist($user);
        $this->addReference(self::USER_REFERENCE . '1', $user);

        //Reference: user-2
        $user = new User();
        $user->setName('RegularUser2');
        $user->setSendReminder(false);
        $user->setEmail('regularuser2@example.com');
        $user->setRoles(['ROLE_USER']);
        $user->setIsEnabled(false);
        $user->setIsVerified(true);
        $user->setPassword(
            $this->hasher->hashPassword($user, 'password2')
        );
        $manager->persist($user);
        $this->addReference(self::USER_REFERENCE . '2', $user);

        //Reference: user-3
        $user = new User();
        $user->setName('RegularUser3');
        $user->setSendReminder(false);
        $user->setEmail('regularuser3@example.com');
        $user->setRoles(['ROLE_USER']);
        $user->setIsEnabled(false);
        $user->setIsVerified(false);
        $user->setPassword(
            $this->hasher->hashPassword($user, 'password3')
        );
        $manager->persist($user);
        $this->addReference(self::USER_REFERENCE . '3', $user);

        //Reference: user-4
        $user = new User();
        $user->setName('AdminUser1');
        $user->setSendReminder(false);
        $user->setEmail('adminuser1@example.com');
        $user->setRoles(['ROLE_ADMIN']);
        $user->setIsEnabled(true);
        $user->setIsVerified(true);
        $user->setPassword(
            $this->hasher->hashPassword($user, 'password4')
        );
        $manager->persist($user);
        $this->addReference(self::USER_REFERENCE . '4', $user);

        //Reference: user-5
        $user = new User();
        $user->setName('RegularUser5');
        $user->setSendReminder(true);
        $user->setEmail('regularuser5@example.com');
        $user->setRoles(['ROLE_USER']);
        $user->setIsEnabled(true);
        $user->setIsVerified(true);
        $user->setPassword(
            $this->hasher->hashPassword($user, 'password5')
        );
        $manager->persist($user);
        $this->addReference(self::USER_REFERENCE . '5', $user);

        $manager->flush();
    }
}