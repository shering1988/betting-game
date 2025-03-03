import GameResponse from "./GameResponse";
import StageResponse from "./StageResponse";

type TournamentResponse = {
    id: number,
    name: string,
    isActive: boolean,
    isDeleted: boolean,
    correctBetScore: number,
    tendingBetScore: number,
    finalBetScore: number,
    gameEndScore: number,
    hasTournamentStarted: boolean,
    games: GameResponse[],
    stages: StageResponse[],
}

export default TournamentResponse;