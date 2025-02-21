import UserResponse from "./UserResponse";

type RankingResponse = {
    average: number,
    bets: number,
    correct: number,
    finals_bet: number,
    game_end: number,
    id: number,
    incorrect: number,
    score: number,
    tending: number,
    user: Pick<UserResponse, "id" | "name" | "profileImage">
}

export default RankingResponse;