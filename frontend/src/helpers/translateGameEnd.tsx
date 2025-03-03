import {GAME_END_OVERTIME, GAME_END_PENALTY, GAME_END_REGULAR} from "../constants/GameEnds";

const translateGameEnd = (gameEnd: string): string | undefined => {
    switch(gameEnd) {
    case "penalty":
        return GAME_END_PENALTY;
    case "overtime":
        return GAME_END_OVERTIME;
    case "regular":
        return GAME_END_REGULAR;
    default:
        return undefined;
    }
};

export default translateGameEnd;