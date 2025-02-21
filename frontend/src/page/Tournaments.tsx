import React, {useContext} from "react";
import useTournaments from "../hook/useTournaments";
import TournamentResponse from "../types/response/TournamentResponse";
import Loader from "../components/Loader";
import Tournament from "../components/Tournament";
import {Alert, Button, Dialog} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useAuth from "../hook/useAuth";
import TournamentForm from "../components/forms/TournamentForm";
import {NotificationContext} from "../context/NotificationContext";

const Tournaments: React.FC = () => {
    const auth = useAuth();
    const tournamentsApi = useTournaments();
    const [tournaments, setTournaments] = React.useState<TournamentResponse[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [hasChanged, setHasChanged] = React.useState<number>(0);
    const [openModal, setOpenModal] = React.useState(false);
    const { setNotification } = useContext(NotificationContext);

    React.useEffect(() => {
        tournamentsApi.getData().then((tournaments:TournamentResponse[]) => {
            setTournaments(tournaments);
            setIsLoading(false);
        }).catch((status: number) => {
            setErrorCode(status);
            setIsLoading(false);
        });
    }, [hasChanged]);

    const handleModalOpen = () => {
        setOpenModal(true);
    };

    const handleModalClose = (error?: boolean) => {
        if(typeof error !== "undefined") {
            if(error) {
                setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            } else {
                setNotification({type: "success", message: "Turnier erfolgreich gespeichert."});
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

    return <div>
        {auth.getUser()?.isAdmin && (
            <>
                <Dialog
                    fullWidth
                    maxWidth={"sm"}
                    open={openModal}
                    onClose={() => handleModalClose()}
                    sx={{backgroundColor: "rgba(0,0,0,0.7)", overflow: "hidden"}}
                >
                    <div>
                        <TournamentForm closeModal={handleModalClose} />
                    </div>
                </Dialog>
                <Button onClick={handleModalOpen} sx={{marginBottom: "1em"}} variant={"contained"} color={"primary"} fullWidth startIcon={<AddCircleIcon />}>
                    Turnier hinzufügen
                </Button>
                <Alert severity="info" sx={{marginBottom: "1em"}}>
                    {"Aktive Turniere können nicht gelöscht werden. Sollte kein aktives Turnier existieren, können sich die Nutzer nicht anmelden."}
                </Alert>
            </>
        )}
        {tournaments.length === 0 && (
            <Alert severity="info">Keine Turniere vorhanden</Alert>
        )}
        {tournaments.map((tournament:TournamentResponse) => {
            return <Tournament onChange={() => setHasChanged(hasChanged + 1)} key={tournament.id} tournament={tournament} />;
        })}
    </div>;
};

export default Tournaments;