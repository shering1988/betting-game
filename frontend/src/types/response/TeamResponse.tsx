import GameResponse from "./GameResponse";

type TeamResponse = {
    id: number,
    name: string,
    shortName: string,
    games: GameResponse[],
}

export default TeamResponse;