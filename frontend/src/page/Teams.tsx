import React, {useContext} from "react";
import useTeams from "../hook/useTeams";
import TeamResponse from "../types/response/TeamResponse";
import Loader from "../components/Loader";
import Team from "../components/Team";
import {Alert, Button, Dialog} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useAuth from "../hook/useAuth";
import TeamForm from "../components/forms/TeamForm";
import {NotificationContext} from "../context/NotificationContext";
import {TournamentContext} from "../context/TournamentContext";

const Teams: React.FC = () => {
    const auth = useAuth();
    const teamsApi = useTeams();
    const [teams, setTeams] = React.useState<TeamResponse[]>([]);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [openModal, setOpenModal] = React.useState(false);
    const [hasChanged, setHasChanged] = React.useState<number>(0);
    const { setNotification } = useContext(NotificationContext);
    const { tournament: storedTournament } = useContext(TournamentContext);

    React.useEffect(() => {
        teamsApi.getData(storedTournament.id).then((teams:TeamResponse[]) => {
            setTeams(teams.sort((a: TeamResponse, b: TeamResponse) => a.name.localeCompare(b.name)));
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
                setNotification({type: "success", message: "Team erfolgreich gespeichert."});
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
                        <TeamForm closeModal={handleModalClose} />
                    </div>
                </Dialog>
                <Button onClick={handleModalOpen} sx={{marginBottom: "1em"}} variant={"contained"} color={"primary"} fullWidth startIcon={<AddCircleIcon />}>
                    Team hinzufügen
                </Button>
            </>
        )}
        {teams.length === 0 && (
            <Alert severity="info">Keine Teams vorhanden</Alert>
        )}
        {teams.map((team:TeamResponse) => {
            return <Team onChange={() => setHasChanged(hasChanged + 1)} team={team} key={team.id} />;
        })}
    </div>;
};

export default Teams;