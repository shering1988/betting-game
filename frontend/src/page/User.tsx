import React, {useContext} from "react";
import useUsers from "../hook/useUsers";
import UserResponse from "../types/response/UserResponse";
import {useParams} from "react-router-dom";
import BetResponse from "../types/response/BetResponse";
import Loader from "../components/Loader";
import Bet from "../components/Bet";
import FinalsBet from "../components/FinalsBet";
import FinalsBetResponse from "../types/response/FinalsBetResponse";
import UserDetail from "../components/User";
import {Alert, Divider} from "@mui/material";
import {TournamentContext} from "../context/TournamentContext";

const User: React.FC = () => {
    const usersApi = useUsers();
    const {userId} = useParams();
    const { tournament: storedTournament } = useContext(TournamentContext);

    const [user, setUser] = React.useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [hasChanged, setHasChanged] = React.useState<number>(0);

    React.useEffect(() => {
        usersApi.getData(storedTournament.id, userId ? parseInt(userId) : undefined).then((users:UserResponse[]) => {
            setUser(users[0]);
            setIsLoading(false);
        }).catch((status: number) => {
            setErrorCode(status);
            setIsLoading(false);
        });
    }, [hasChanged]);

    if((!isLoading && !user) || errorCode) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    let score = 0;

    user?.bets.map((bet) => {
        if(bet.game.tournament.id === storedTournament.id) {
            score += bet.score.score;
        }
        return;
    });

    user?.finalsBets.filter((finalsBet:FinalsBetResponse) => finalsBet.tournament.id === storedTournament.id).map((finalsBet: FinalsBetResponse) => {
        if(finalsBet.tournament.id === storedTournament.id) {
            score += finalsBet.score.points;
        }
        return;
    });

    return <div>
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>NUTZERINFORMATIONEN</Divider>
        <UserDetail score={score} onChange={() => setHasChanged(hasChanged + 1)} user={user as UserResponse} />
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>FINALTIPP</Divider>
        {user?.finalsBets.filter((finalsBet:FinalsBetResponse) => finalsBet.tournament.id === storedTournament.id).length === 0 && (
            <Alert severity="info">Noch kein Finaltipp vorhanden oder noch nicht sichtbar, weil das Turnier noch nicht begonnen hat.</Alert>
        )}
        {user?.finalsBets.filter((finalsBet:FinalsBetResponse) => finalsBet.tournament.id === storedTournament.id).map((finalsBet: FinalsBetResponse) => {
            return <FinalsBet onChange={() => setHasChanged(hasChanged + 1)} showUser={false} key={`finals-bet-${finalsBet.id}`} hasTournamentStarted={true} finalsBet={finalsBet} />;
        })}
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>TIPPS</Divider>
        {user?.bets.length === 0 && (
            <Alert severity="info">Keine Tipps vorhanden oder noch nicht sichtbar, weil noch kein Spiel begonnen hat, bei dem ein Tipp abgegeben wurde.</Alert>
        )}
        {user?.bets.sort((a: BetResponse, b: BetResponse) => b.game.start.localeCompare(a.game.start)).map((bet: BetResponse) => {
            bet.user = user;
            return <div key={`bet-${bet.id}`}>
                <Bet onChange={() => setHasChanged(hasChanged + 1)} showUserName={false} showGameInfo={true} bet={bet} />
            </div>;
        })}
    </div>;
};

export default User;