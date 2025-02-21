import React, {useContext} from "react";
import Loader from "../components/Loader";
import useStatistics from "../hook/useStatistics";
import StatisticsResponse, {
    GoalTeamResponse,
    LosingTeamResponse, ResultsResponse,
    SelectedTeamResponse, UserBets,
    WinningTeamResponse
} from "../types/response/StatisticsResponse";
import {TournamentContext} from "../context/TournamentContext";
import Box from "@mui/material/Box";
import {Card, LinearProgress, useTheme} from "@mui/material";
import Typography from "@mui/material/Typography";
import CountUp from "react-countup";
import TeamListItem from "../components/TeamListItem";
import {PieChart} from "@mui/x-charts";
import Avatar from "@mui/material/Avatar";
import UserListItem from "../components/UserListItem";
import ResultListItem from "../components/ResultListItem";

const Statistics: React.FC = () => {
    const theme = useTheme();
    const statisticsApi = useStatistics();
    const { tournament: storedTournament } = useContext(TournamentContext);
    const [statistics, setStatistics] = React.useState<StatisticsResponse>();
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);

    const [progress, setProgress] = React.useState(0);
    const [correctPercentageFinalsBets, setCorrectPercentageFinalsBets] = React.useState(0);

    React.useEffect(() => {
        if(storedTournament.id) {
            statisticsApi.getData(storedTournament.id).then((data: StatisticsResponse) => {
                setStatistics(data);
                setIsLoading(false);
            }).catch((status: number) => {
                setErrorCode(status);
                setIsLoading(false);
            });
        }
    }, []);

    React.useEffect(() => {
        const timerProgress = setInterval(() => {
            setProgress((prevProgress) => (prevProgress >= (((statistics?.games?.finished ?? 0) / (statistics?.games?.overall ?? 1)) * 100) ? (((statistics?.games?.finished ?? 0) / (statistics?.games?.overall ?? 1)) * 100) : prevProgress + 5));
        }, 100);
        return () => {
            clearInterval(timerProgress);
        };
    }, [statistics]);

    React.useEffect(() => {
        const timerFinalsBet = setInterval(() => {
            setCorrectPercentageFinalsBets((prevProgress) => (prevProgress >= (((statistics?.finalsBets?.correct ?? 0) / ((statistics?.finalsBets?.overall ?? 1) * 2)) * 100) ? (((statistics?.finalsBets?.correct ?? 0) / ((statistics?.finalsBets?.overall ?? 1) * 2)) * 100) : prevProgress + 5));
        }, 100);
        return () => {
            clearInterval(timerFinalsBet);
        };
    }, [statistics]);

    if(errorCode && !isLoading) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    return <Box sx={{paddingTop: "1em", gap: "1em", flexWrap: "wrap", display: "flex", flexDirection: {xs: "column", sm: "row"}}}>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Teilnehmende</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Anzahl</Typography>
                <Typography variant={"h3"} color={"primary"}>
                    <CountUp start={0} end={statistics?.users ?? 0} duration={2} />
                </Typography>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Offene Punkte</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Anzahl</Typography>
                <Typography variant={"h3"} color={"primary"}>
                    <CountUp start={0} end={statistics?.tournament.scoringLeft ?? 0} duration={2} />
                </Typography>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Tipps</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Insgesamt</Typography>
                <Typography variant={"h3"} color={"primary"}>
                    <CountUp start={0} end={statistics?.bets.overall ?? 0} duration={2} />
                </Typography>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Turnierfortschritt</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Beendete Spiele</Typography>
                <div style={{width: "100%", marginBottom: "1em"}}>
                    <LinearProgress value={progress} variant={"determinate"} />
                </div>
                <Typography variant={"h5"} color={"primary"}>
                    <CountUp start={0} end={statistics?.games?.finished ?? 0} duration={2} /> / {statistics?.games.overall ?? 0}
                </Typography>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Tipps</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Richtige</Typography>
                <div style={{width: "100%"}}>
                    {statistics?.userBets.sort((a: UserBets,b: UserBets) => b.correct - a.correct).slice(0, 3).map((userBet: UserBets) => {
                        return <UserListItem key={`userItem-${userBet.user.id}`} user={userBet.user} value={userBet.correct} />;
                    })}
                </div>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Tipps</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Tendenz</Typography>
                <div style={{width: "100%"}}>
                    {statistics?.userBets.sort((a: UserBets,b: UserBets) => b.tending - a.tending).slice(0, 3).map((userBet: UserBets) => {
                        return <UserListItem key={`userItem-${userBet.user.id}`} user={userBet.user} value={userBet.tending} />;
                    })}
                </div>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Tipps</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Meiste falsch</Typography>
                <div style={{width: "100%"}}>
                    {statistics?.userBets.sort((a: UserBets,b: UserBets) => b.incorrect - a.incorrect).slice(0, 3).map((userBet: UserBets) => {
                        return <UserListItem key={`userItem-${userBet.user.id}`} user={userBet.user} value={userBet.incorrect} />;
                    })}
                </div>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Tipps</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Wenigste falsch</Typography>
                <div style={{width: "100%"}}>
                    {statistics?.userBets.sort((a: UserBets,b: UserBets) => a.incorrect - b.incorrect).slice(0, 3).map((userBet: UserBets) => {
                        return <UserListItem key={`userItem-${userBet.user.id}`} user={userBet.user} value={userBet.incorrect} />;
                    })}
                </div>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Finaltipps</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Richtige Tipps</Typography>
                <div style={{width: "100%", marginBottom: "1em"}}>
                    <LinearProgress value={correctPercentageFinalsBets} variant={"determinate"} />
                </div>
                <Typography variant={"h5"} color={"primary"}>
                    <CountUp start={0} end={statistics?.finalsBets?.correct ?? 0} duration={2} /> / {(statistics?.finalsBets.overall ?? 0) * 2} richtig
                </Typography>
            </Box>
        </Card>
        {storedTournament.hasTournamentStarted && (
            <Card sx={{
                display: "flex",
                justifyContent: "start",
                borderBottom: "2px solid #666666",
                marginBottom: "1em",
                flexDirection: "column",
                flex: "0 1 calc(50% - 10px)",
                animation: "pulse 0.5s ease-in infinite",
                backgroundColor: "rgba(255, 255, 255, 0.05)"
            }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: "1em",
                    padding: "1em"
                }}>
                    <Typography variant={"h5"}>Finaltipps</Typography>
                    <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Meist gewählte Teams</Typography>
                    <div style={{width: "100%"}}>
                        {statistics?.finalsBets.selectedTeams.sort((a: SelectedTeamResponse,b: SelectedTeamResponse) => b.selected - a.selected).slice(0, 3).map((selectedTeam: SelectedTeamResponse) => {
                            return <TeamListItem key={`listItem-${selectedTeam.team.id}`} team={selectedTeam.team} value={selectedTeam.selected} />;
                        })}
                    </div>
                </Box>
            </Card>
        )}
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Teams</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Meiste Siege</Typography>
                <div style={{width: "100%"}}>
                    {statistics?.teams.wins.sort((a: WinningTeamResponse,b: WinningTeamResponse) => b.wins - a.wins).slice(0, 3).map((selectedTeam: WinningTeamResponse) => {
                        return <TeamListItem key={`listItem-${selectedTeam.team.id}`} team={selectedTeam.team} value={selectedTeam.wins} />;
                    })}
                </div>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Teams</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Meiste Niederlagen</Typography>
                <div style={{width: "100%"}}>
                    {statistics?.teams.loss.sort((a: LosingTeamResponse,b: LosingTeamResponse) => b.loss - a.loss).slice(0, 3).map((selectedTeam: LosingTeamResponse) => {
                        return <TeamListItem key={`listItem-${selectedTeam.team.id}`} team={selectedTeam.team} value={selectedTeam.loss} />;
                    })}
                </div>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Teams</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Meiste Tore</Typography>
                <div style={{width: "100%"}}>
                    {statistics?.teams.goals.sort((a: GoalTeamResponse,b: GoalTeamResponse) => b.goals - a.goals).slice(0, 3).map((selectedTeam: GoalTeamResponse) => {
                        return <TeamListItem key={`listItem-${selectedTeam.team.id}`} team={selectedTeam.team} value={selectedTeam.goals} />;
                    })}
                </div>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Teams</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Meiste Gegentore</Typography>
                <div style={{width: "100%"}}>
                    {statistics?.teams.goals.sort((a: GoalTeamResponse,b: GoalTeamResponse) => b.concededGoals - a.concededGoals).slice(0, 3).map((selectedTeam: GoalTeamResponse) => {
                        return <TeamListItem key={`listItem-${selectedTeam.team.id}`} team={selectedTeam.team} value={selectedTeam.concededGoals} />;
                    })}
                </div>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Ergebnisse</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Häufigkeit</Typography>
                <div style={{width: "100%"}}>
                    {statistics?.games.results.sort((a: ResultsResponse,b: ResultsResponse) => b.count - a.count).slice(0, 3).map((selectedResult: ResultsResponse) => {
                        return <ResultListItem key={`listItem-${selectedResult.result}`} result={selectedResult.result} value={selectedResult.count} />;
                    })}
                </div>
            </Box>
        </Card>
        <Card sx={{
            display: "flex",
            justifyContent: "start",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            flexDirection: "column",
            flex: "0 1 calc(50% - 10px)",
            animation: "pulse 0.5s ease-in infinite",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                padding: "1em"
            }}>
                <Typography variant={"h5"}>Tipps</Typography>
                <Typography sx={{mb: "1em"}} variant="body2" color="secondary">Ergebnisse</Typography>
                <PieChart
                    series={[
                        {
                            data: [
                                { id: 0, value: statistics?.bets.correct ?? 0, label: "Richtig", color: theme.palette.primary.light },
                                { id: 1, value: statistics?.bets.false ?? 0, label: "Falsch", color: theme.palette.primary.dark },
                                { id: 2, value: statistics?.bets.tending ?? 0, label: "Tendenziell", color: theme.palette.primary.main },
                            ],
                            innerRadius: 30
                        },
                    ]}
                    margin={{ right: 0 }}
                    width={250}
                    height={180}
                    legend={{hidden:true}}
                    sx={{width: "auto", height: "auto"}}
                />
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                mb: "1em",
                width: "100%"
            }}
            >
                <div style={{justifyContent: "center", display: "flex", marginRight: "0.5em"}}><Avatar sx={{ mr: "0.5em", width: "20px", height: "20px", bgcolor: theme.palette.primary.light }} alt="Richtig">&nbsp;</Avatar> Richtig</div>
                <div style={{justifyContent: "center", display: "flex", marginRight: "0.5em"}}><Avatar sx={{ mr: "0.5em", width: "20px", height: "20px", bgcolor: theme.palette.primary.dark }} alt="Falsch">&nbsp;</Avatar> Falsch</div>
                <div style={{justifyContent: "center", display: "flex"}}><Avatar sx={{ mr: "0.5em", width: "20px", height: "20px", bgcolor: theme.palette.primary.main }} alt="Tendenziell">&nbsp;</Avatar> Tendenziell</div>
            </Box>
        </Card>
    </Box>;
};

export default Statistics;