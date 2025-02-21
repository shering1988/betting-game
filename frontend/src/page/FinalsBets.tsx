import React, {useContext} from "react";
import useFinalsBets from "../hook/useFinalsBets";
import FinalsBetResponse from "../types/response/FinalsBetResponse";
import Loader from "../components/Loader";
import {Alert, Button, Dialog} from "@mui/material";
import FinalsBet from "../components/FinalsBet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useAuth from "../hook/useAuth";
import {TournamentContext} from "../context/TournamentContext";
import FinalsBetForm from "../components/forms/FinalsBetForm";
import {NotificationContext} from "../context/NotificationContext";
import Box from "@mui/material/Box";

const FinalsBets = () => {
    const auth = useAuth();
    const finalsBetsApi = useFinalsBets();
    const [finalsBets, setFinalsBets] = React.useState<FinalsBetResponse[]>([]);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const { tournament: storedTournament } = useContext(TournamentContext);
    const [openModal, setOpenModal] = React.useState(false);
    const [hasChanged, setHasChanged] = React.useState<number>(0);
    const { setNotification } = useContext(NotificationContext);

    React.useEffect(() => {
        if(storedTournament.id) {
            finalsBetsApi.getData(storedTournament.id).then((finalsBets:FinalsBetResponse[]) => {
                setFinalsBets(finalsBets);
                setIsLoading(false);
            }).catch((status: number) => {
                setErrorCode(status);
                setIsLoading(false);
            });
        }
    }, [hasChanged]);

    const handleModalOpen = () => {
        setOpenModal(true);
    };

    const handleModalClose = (error?: boolean) => {
        if(typeof error !== "undefined") {
            if(error) {
                setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            } else {
                setNotification({type: "success", message: "Finaltipp erfolgreich gespeichert."});
                setHasChanged(hasChanged + 1);
            }
        }
        setOpenModal(false);
    };

    if(errorCode && !isLoading) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    const ownBet = finalsBets.find((finalsBet: FinalsBetResponse) => finalsBet.user.id === auth.getUser()?.id);

    return <Box sx={{paddingTop: "1em", gap: "1em", flexWrap: "wrap", display: "flex", flexDirection: {xs: "column", sm: "row"}}}>
        {(auth.getUser()?.isAdmin || (!storedTournament.hasTournamentStarted && finalsBets.filter((finalBet: FinalsBetResponse) => finalBet.user.id === auth.getUser()?.id).length === 0)) && (
            <>
                <Dialog
                    fullWidth
                    maxWidth={"sm"}
                    open={openModal}
                    onClose={() => handleModalClose()}
                    sx={{backgroundColor: "rgba(0,0,0,0.7)", overflow: "hidden"}}
                >
                    <div>
                        <FinalsBetForm withUser={!!auth.getUser()?.isAdmin} closeModal={handleModalClose} />
                    </div>
                </Dialog>
                <Button onClick={handleModalOpen} sx={{marginBottom: "1em"}} variant={"contained"} color={"primary"} fullWidth startIcon={<AddCircleIcon />}>
                    {auth.getUser()?.isAdmin ? "Finaltipp hinzufügen" : "Finaltipp abgeben"}
                </Button>
            </>
        )}
        {finalsBets.length === 0 && (
            <Alert sx={{width: "100%", marginBottom: "1em"}} severity="info">Keine Finaltipps vorhanden oder das Turnier hat noch nicht begonnen. Finaltipps werden erst nach Start des Turniers veröffentlicht.</Alert>
        )}
        {storedTournament.hasTournamentStarted && !auth.getUser()?.isAdmin && (
            <Alert sx={{width: "100%", marginBottom: "1em"}} severity="info">Das Turnier hat begonnen, Finaltipps können nicht mehr angelegt oder bearbeitet werden.</Alert>
        )}
        {ownBet && (
            <FinalsBet onChange={() => setHasChanged(hasChanged + 1)} hasTournamentStarted={storedTournament.hasTournamentStarted} key={`finalsbet-${ownBet.id}`} finalsBet={ownBet} />
        )}
        {finalsBets.map((finalsBet:FinalsBetResponse) => {
            if(finalsBet.user.id === auth.getUser()?.id) {
                return;
            }

            return <FinalsBet onChange={() => setHasChanged(hasChanged + 1)} hasTournamentStarted={storedTournament.hasTournamentStarted} key={`finalsbet-${finalsBet.id}`} finalsBet={finalsBet} />;
        })}
    </Box>;
};

export default FinalsBets;