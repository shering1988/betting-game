<?php

namespace App\Constants;

class MailConstants {
    const SEND_REMINDER_SUBJECT = 'Tippspiel: Erinnerung!';
    const SEND_REMINDER_BODY = 'Hallo, die folgenden Partien finden bald statt und haben von dir noch keine Tippabgabe: %s';
    const SEND_REMINDER_GAME_ITEM = '%s gegen %s um %s Uhr';
}