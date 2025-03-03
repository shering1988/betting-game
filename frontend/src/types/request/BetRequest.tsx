type BetRequest = {
    id?: number,
    game: number,
    teamHomeScore: number,
    teamGuestScore: number,
    gameEnd: string | null,
    user?: number
}

export default BetRequest;