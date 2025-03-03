import React, {useContext} from "react";
import useStages from "../hook/useStages";
import StageResponse from "../types/response/StageResponse";
import Loader from "../components/Loader";
import Stage from "../components/Stage";
import {Alert, Button, Dialog} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useAuth from "../hook/useAuth";
import {TournamentContext} from "../context/TournamentContext";
import StageForm from "../components/forms/StageForm";
import {NotificationContext} from "../context/NotificationContext";

const Stages = () => {
    const auth = useAuth();
    const stagesApi = useStages();
    const [stages, setStages] = React.useState<StageResponse[]>([]);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const { tournament: storedTournament } = useContext(TournamentContext);
    const [openModal, setOpenModal] = React.useState(false);
    const [hasChanged, setHasChanged] = React.useState<number>(0);
    const { setNotification } = useContext(NotificationContext);

    React.useEffect(() => {
        if(storedTournament.id) {
            stagesApi.getData(storedTournament.id).then((stages:StageResponse[]) => {
                setStages(stages);
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
                setNotification({type: "success", message: "Gruppe erfolgreich gespeichert."});
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
                        <StageForm closeModal={handleModalClose} />
                    </div>
                </Dialog>
                <Button onClick={handleModalOpen} sx={{marginBottom: "1em"}} variant={"contained"} color={"primary"} fullWidth startIcon={<AddCircleIcon />}>
                    Gruppe hinzufügen
                </Button>
            </>
        )}
        {stages.length === 0 && (
            <Alert severity="info">Keine Gruppen vorhanden</Alert>
        )}
        {stages.map((stage:StageResponse) => {
            return <Stage onChange={() => setHasChanged(hasChanged + 1)} stage={stage} key={`stage-${stage.id}`} />;
        })}
    </div>;
};

export default Stages;