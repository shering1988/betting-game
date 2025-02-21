import GameResponse from "./GameResponse";

type StageResponse = {
    id: number,
    name: string,
    isFinal: boolean,
    isGrandFinal: boolean,
    games: GameResponse[]
}

export default StageResponse;