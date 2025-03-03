import React, {useContext} from "react";
import useGames from "../hook/useGames";
import GameResponse from "../types/response/GameResponse";
import {useParams} from "react-router-dom";
import Loader from "../components/Loader";
import {default as GameDetail} from "../components/Game";
import BetResponse from "../types/response/BetResponse";
import {Alert, Button, Dialog, Divider} from "@mui/material";
import Bet from "../components/Bet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useAuth from "../hook/useAuth";
import {TournamentContext} from "../context/TournamentContext";
import BetForm from "../components/forms/BetForm";
import {NotificationContext} from "../context/NotificationContext";

const Game = () => {
    const auth = useAuth();
    const gamesApi = useGames();
    const { gameId } = useParams();
    const [game, setGame] = React.useState<GameResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [hasChanged, setHasChanged] = React.useState<number>(0);
    const { tournament: storedTournament } = useContext(TournamentContext);
    const { setNotification } = useContext(NotificationContext);

    const [openModal, setOpenModal] = React.useState(false);

    const handleModalOpen = () => {
        setOpenModal(true);
    };

    const handleModalClose = (error?: boolean) => {
        if(typeof error !== "undefined") {
            if(error) {
                setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            } else {
                setNotification({type: "success", message: "Spiel erfolgreich gespeichert."});
            }
        }
        setOpenModal(false);
    };

    React.useEffect(() => {
        if(storedTournament.id) {
            gamesApi.getData(storedTournament.id, gameId ? parseInt(gameId) : undefined).then((games:GameResponse[]) => {
                setGame(games[0]);
                setIsLoading(false);
            }).catch((status: number) => {
                setErrorCode(status);
                setIsLoading(false);
            });
        }
    }, [hasChanged]);

    if((!isLoading && !game) || errorCode) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    const ownBet = game?.bets.find((bet: BetResponse) => bet.user.id === auth.getUser()?.id);

    return <div>
        {auth.getUser()?.isAdmin && (
            <>
                <Dialog
                    fullWidth
                    maxWidth={"sm"}
                    open={openModal}
                    onClose={() => handleModalClose()}
                    hideBackdrop={true}
                    sx={{backgroundColor: "rgba(0,0,0,0.7)", overflow: "hidden"}}
                >
                    <div>
                        <BetForm withUser={true} game={game as GameResponse} closeModal={handleModalClose} />
                    </div>
                </Dialog>
                <Button onClick={handleModalOpen} sx={{marginBottom: "1em"}} variant={"contained"} color={"primary"} fullWidth startIcon={<AddCircleIcon />}>
                    Tipp hinzufügen
                </Button>
            </>
        )}
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>SPIELINFORMATIONEN</Divider>
        <GameDetail isDetailView={true} onChange={() => setHasChanged(hasChanged + 1)} game={game as GameResponse} />
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>TIPPS</Divider>
        {Date.parse(game?.start ?? "") > Date.now() && !auth.getUser()?.isAdmin && (
            <Alert sx={{marginBottom: "1em"}} severity="info">Das Spiel hat noch nicht begonnen, es werden deshalb keine Tipps von anderen Teilnehmenden angezeigt.</Alert>
        )}
        {ownBet && (
            <Bet onChange={() => setHasChanged(hasChanged + 1)} bet={ownBet} key={`bet-${ownBet.id}`} />
        )}
        {game?.bets.map((bet: BetResponse) => {
            if(bet.user.id === auth.getUser()?.id) {
                return;
            }

            return <Bet onChange={() => setHasChanged(hasChanged + 1)} bet={bet} key={`bet-${bet.id}`} />;
        })}
    </div>;
};

export default Game;