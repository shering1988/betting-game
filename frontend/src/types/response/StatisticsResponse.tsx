import TeamResponse from "./TeamResponse";
import UserResponse from "./UserResponse";

export type GameStats = {
    overall: number;
    finished: number;
    results: ResultsResponse[]
}

export type SelectedTeamResponse = {
    team: TeamResponse;
    selected: number;
}

export type FinalsBetStats = {
    overall: number;
    correct: number;
    selectedTeams: SelectedTeamResponse[]
}

export type BetStats = {
    overall: number;
    correct: number;
    tending: number;
    false: number;
    open: number;
}

export type WinningTeamResponse = {
    team: TeamResponse;
    wins: number;
}

export type LosingTeamResponse = {
    team: TeamResponse;
    loss: number;
}

export type GoalTeamResponse = {
    team: TeamResponse;
    goals: number;
    concededGoals: number;
}

export type TeamStats = {
    overall: number;
    wins: WinningTeamResponse[],
    loss: LosingTeamResponse[],
    goals: GoalTeamResponse[],
}

export type TournamentStats = {
    scoringLeft: number;
}

export type ResultsResponse = {
    result: string;
    count: number;
}

export type UserBets = {
    user: UserResponse;
    correct: number;
    incorrect: number;
    tending: number;
}

type StatisticsResponse = {
    users: number;
    games: GameStats;
    finalsBets: FinalsBetStats;
    bets: BetStats;
    teams: TeamStats;
    tournament: TournamentStats;
    userBets: UserBets[];
}

export default StatisticsResponse;