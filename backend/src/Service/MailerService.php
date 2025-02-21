<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class MailerService {
    public function sendPlainTextMessage(string $subject, string $content, array|string $toEmail, MailerInterface $mailer): void
    {
        if(!is_array($toEmail)) {
            $toEmail = [$toEmail];
        }

        foreach($toEmail as $recipient) {
            $message = (new Email())
                ->subject($subject)
                ->to($recipient)
                ->text($content);

            $mailer->send($message);
        }
    }
}
