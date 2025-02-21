import TeamResponse from "./TeamResponse";
import UserResponse from "./UserResponse";
import TournamentResponse from "./TournamentResponse";

type FinalsBetResponse = {
    id: number,
    teamHome: TeamResponse,
    teamGuest: TeamResponse,
    isTeamHomeEliminated: boolean,
    isTeamGuestEliminated: boolean,
    user: Pick<UserResponse, "id" | "name" | "profileImage">
    tournament: TournamentResponse,
    score: {
        correct: number,
        points: number
    }
}

export default FinalsBetResponse;