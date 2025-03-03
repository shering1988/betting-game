import {Typography} from "@mui/material";
import React, {useContext} from "react";
import useTournaments from "../hook/useTournaments";
import TournamentResponse from "../types/response/TournamentResponse";
import Loader from "../components/Loader";
import {TournamentContext} from "../context/TournamentContext";
import Card from "@mui/material/Card";

const Rules: React.FC = () => {
    const tournamentsApi = useTournaments();
    const [tournament, setTournament] = React.useState<TournamentResponse | undefined>(undefined);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const { tournament: storedTournament } = useContext(TournamentContext);

    React.useEffect(() => {
        if(storedTournament.id) {
            tournamentsApi.getData(storedTournament.id).then((tournaments:TournamentResponse[]) => {
                setTournament(tournaments[0]);
                setIsLoading(false);
            }).catch((status: number) => {
                setErrorCode(status);
                setIsLoading(false);
            });
        }
    }, []);

    if((!isLoading && !tournament) || errorCode) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    return <div>
        {tournament && (
            <Card
                variant="outlined"
                sx={{
                    p: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                }}
            >
                <Typography color={"primary"} variant="h5">Punktevergabe</Typography>
                <Typography variant="body1">Für jeden Tipp auf das richtige Ergebnis gibt es <span style={{fontWeight: 700}}>{tournament.correctBetScore} Punkte</span>. Bei einem Tipp, bei dem die Toranzahl nicht korrekt ist, aber dennoch die richtige Mannschaft gewonnen hat, gibt es <span style={{fontWeight: 700}}>{tournament.tendingBetScore} Punkt(e)</span>. Für Tipps, die weder die richtige Toranzahl noch die richtige Mannschaft gewählt haben gibt es keinen Punkt. In der K.O.-Phase des Turniers ist es möglich pro Spiel <span style={{fontWeight: 700}}>{tournament.gameEndScore} Punkt(e) Bonus</span> zu bekommen, wenn auf das richtige Spielende (Regulär, Verlängerung, Elfmeterschiessen) getippt wird. Dieser Bonus gilt auch, wenn der Tipp auf die Toranzahl nur tendenziell richtig oder sogar falsch ist. Beim Elfmeterschiessen zählt die Gesamtzahl der Tore, also das Ergebnis nach 120 Minuten plus die Anzahl der Tore aus dem Elfmeterschiessen.</Typography>
                <br />
                <Typography color={"primary"} variant="h5">Tippabgabe</Typography>
                <Typography variant="body1">Die Tippabgabe ist immer bis zum offiziellen Spielbeginn möglich. Ein nachträgliches Tippen oder ein manuelles Nachtragen ist nicht möglich. Abgegebene Tipps können bis zum Spielbeginn jederzeit korrigiert werden. Jeder Teilnehmende ist selbst dafür verantwortlich rechtzeitig den Tipp abzugeben.</Typography>
                <br />
                <Typography color={"primary"} variant="h5">Finaltipp</Typography>
                <Typography variant="body1">Mit dem Finaltipp kann darauf getippt werden, welche beiden Mannschaften im Finale gegeneinander antreten werden. Für jede richtig ausgewählte Mannschaft erhält man <span style={{fontWeight: 700}}>{tournament.finalBetScore} Punkt(e)</span>. Wichtig: der Finaltipp muss vor Beginn des Turniers abgegeben werden. Es ist außerdem möglich zweimal die selbe Mannschaft auszuwählen und würde damit beim Finaleinzug dieses Teams die volle Punktzahl für den Finaltipp erhalten.</Typography>
                <br />
                <Typography color={"primary"} variant="h5">Gewinn</Typography>
                <Typography variant="body1">Der Teilnehmende, der am Ende das Turniers die meisten Punkte gesammelt hat, erhält das Recht den Wanderpokal, inkl. Eingravur des Namens, 2 Jahre zu beherbergen. Es ist sicherzustellen, dass der Pokal in dieser Zeit nicht abhanden kommt. Der Pokal muss vor Beginn des nächsten Turniers wieder abgegeben werden.</Typography>
            </Card>
        )}

    </div>;
};

export default Rules;