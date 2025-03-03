import TeamResponse from "./TeamResponse";
import StageResponse from "./StageResponse";
import TournamentResponse from "./TournamentResponse";
import BetResponse from "./BetResponse";

type GameResponse = {
    id: number,
    teamHome: TeamResponse,
    teamGuest: TeamResponse,
    stage: StageResponse,
    tournament: TournamentResponse,
    isDeleted: boolean,
    start: string,
    scoreTeamHome: number | null,
    scoreTeamGuest: number | null,
    gameEnd: "regular" | "overtime" | "penalty" | null,
    bets: BetResponse[],
}

export default GameResponse;