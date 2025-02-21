import React, {useContext} from "react";
import useRanking from "../hook/useRanking";
import RankingResponse from "../types/response/RankingResponse";
import Loader from "../components/Loader";
import Rank from "../components/Rank";
import {TournamentContext} from "../context/TournamentContext";
import {Accordion, AccordionDetails, AccordionSummary, Alert, Typography} from "@mui/material";
import StyledLink from "../styledComponents/StyledLink";
import {ArrowDropDownIcon} from "@mui/x-date-pickers";
import ChartResponse from "../types/response/ChartResponse";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

const Ranking: React.FC = () => {
    const rankingApi = useRanking();
    const [ranks, setRanks] = React.useState<RankingResponse[]>([]);
    const [chartData, setChartData] = React.useState<ChartResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const { tournament: storedTournament } = useContext(TournamentContext);

    React.useEffect(() => {
        if(storedTournament.id) {
            rankingApi.getData(storedTournament.id).
                then((data:RankingResponse[]) => {
                    setRanks(data);
                }).catch((status: number) => {
                    setErrorCode(status);
                });

            rankingApi.getChartData(storedTournament.id).
                then((data:ChartResponse) => {
                    setChartData(data);
                    setIsLoading(false);
                }).catch((status: number) => {
                    setErrorCode(status);
                    setIsLoading(false);
                });
        }
    }, [storedTournament]);

    if(errorCode && !isLoading) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    return <div>
        {chartData && (
            <Accordion square={true} sx={{marginBottom: "1em", backgroundColor: "rgba(255, 255, 255, 0.05)"}}>
                <AccordionSummary
                    expandIcon={<ArrowDropDownIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography>Turnierverlauf</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ResponsiveContainer height={400} width={"95%"} >
                        <LineChart
                            data={chartData.users}
                            margin={{ left: 5, right: 5, top: 5, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={"date"} />
                            <YAxis />
                            <Tooltip
                                itemSorter={(item) => {
                                    return (item.value as number) * -1;
                                }}
                                contentStyle={{
                                    borderColor: "rgb(50,50,50)",
                                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                                    borderRadius: "5px",
                                    zIndex: 1000
                                }}
                                wrapperStyle={{
                                    zIndex: 1000
                                }}
                                formatter={(value, name) => {
                                    return [value, chartData?.lines.find((line) => line.id === name)?.name ?? "Fehler"];
                                } }
                            />
                            {chartData.lines.map((line) => {
                                return <Line label={line.name} key={`data-line-${line.id}`} type={"step"} dataKey={line.id} stroke={line.color} />;
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </AccordionDetails>
            </Accordion>
        )}

        {(!storedTournament.hasTournamentStarted) && (
            <Alert sx={{marginBottom: "1em"}} severity="info">Du kannst bis zum Turnierstart (Anstosszeit Eröffnungsspiel) noch deinen Finaltipp anlegen oder bearbeiten: <StyledLink to={"/finalsBets"}>jetzt Finaltipp anlegen!</StyledLink></Alert>
        )}
        {ranks.length === 0 && (
            <Alert sx={{marginBottom: "1em"}} severity="info">Es wurden noch keine Tipps abgegeben.</Alert>
        )}
        {ranks.map((rank: RankingResponse, index: number) => {
            return <Rank place={index} key={`rank-card-${rank.id}`} rank={rank} />;
        })}
    </div>;
};

export default Ranking;