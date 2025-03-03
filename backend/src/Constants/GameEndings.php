<?php

namespace App\Constants;

class GameEndings {
    const GAME_ENDING_REGULAR = 'regular';
    const GAME_ENDING_OVERTIME = 'overtime';
    const GAME_ENDING_PENALTY = 'penalty';

    const GAME_ENDINGS = [self::GAME_ENDING_REGULAR, self::GAME_ENDING_OVERTIME, self::GAME_ENDING_PENALTY];

    const ENDING_CORRECT = 'correct';
    const ENDING_INCORRECT = 'incorrect';
    const ENDING_TENDING = 'tending';

}