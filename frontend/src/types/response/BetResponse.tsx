import GameResponse from "./GameResponse";
import UserResponse from "./UserResponse";

type BetResponse = {
    score: {
        goal_result: string | null,
        game_end_result: string | null,
        score: number,
    },
    id: number,
    game: GameResponse,
    teamHomeScore: number,
    teamGuestScore: number,
    gameEnd: string | null,
    user: Pick<UserResponse, "id" | "name" | "profileImage">
}

export default BetResponse;