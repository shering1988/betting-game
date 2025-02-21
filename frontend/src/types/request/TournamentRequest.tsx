type TournamentRequest = {
    id?: number,
    name: string,
    isActive: boolean,
    correctBetScore: number,
    tendingBetScore: number,
    finalBetScore: number,
    gameEndScore: number,
}

export default TournamentRequest;