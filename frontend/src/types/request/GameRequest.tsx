type GameRequest = {
    id?: number,
    teamHome: number,
    teamGuest: number,
    stage: number,
    tournament: number,
    start: string,
    scoreTeamHome: number | null,
    scoreTeamGuest: number | null,
    gameEnd: "penalty" | "overtime" | "regular" | null,
}

export default GameRequest;