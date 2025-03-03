import React, {useContext} from "react";
import {
    Stack,
    Divider,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Loader from "../Loader";
import useTeams from "../../hook/useTeams";
import TeamResponse from "../../types/response/TeamResponse";
import TeamRequest from "../../types/request/TeamRequest";
import Ajv, {ErrorObject} from "ajv";
import ajvErrors from "ajv-errors";
import TeamSchema from "../../schemas/Team";
import {NotificationContext} from "../../context/NotificationContext";

type TeamProps = {
    team?: TeamResponse;
    closeModal: (error?: boolean) => void;
}

const TeamForm: React.FC<TeamProps> = (props) => {
    const {team, closeModal} = props;

    const ajv = new Ajv({allErrors: true});
    ajvErrors(ajv);
    const validate = ajv.compile(TeamSchema);

    const teamApi = useTeams();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { setNotification } = useContext(NotificationContext);

    const [localTeam, setLocalTeam] = React.useState<TeamRequest>(
        team ? {
            id: team.id,
            name: team.name,
            shortName: team.shortName
        } : {
            name: "",
            shortName: ""
        }
    );

    const handlePropertyChange = React.useCallback(
        <Key extends keyof TeamRequest>(key: Key, value: TeamRequest[Key]) => {
            setLocalTeam((current) => ({ ...current, [key]: value }));
        },
        [],
    );

    const handleSubmit = () => {
        if (validate(localTeam)) {
            if(team) {
                teamApi.postData(team.id, localTeam).then(() => {
                    setIsLoading(false);
                    closeModal(false);
                }).catch(() => {
                    setIsLoading(false);
                    closeModal(true);
                });
            } else {
                teamApi.putData(localTeam).then(() => {
                    setIsLoading(false);
                    closeModal(false);
                }).catch(() => {
                    setIsLoading(false);
                    closeModal(true);
                });
            }
        } else {
            if(validate.errors) {
                let errorString = "";

                validate.errors.forEach((value: ErrorObject) => {
                    errorString = errorString+ "- " + value.message + "\n";
                });

                setNotification({type: "error", message: "Bitte behebe die folgenden Fehler: \n\n" + errorString});
            } else {
                setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            }
        }
    };

    if(isLoading) {
        return <Loader />;
    }

    return <Stack sx={{padding: "2em", backgroundColor: "rgb(20,20,20)"}} justifyContent="center" alignItems="center" spacing={2} direction={"column"}>
        <Divider>TEAM</Divider>
        <TextField
            fullWidth
            type="text"
            value={localTeam.name}
            onChange={(event) => {
                handlePropertyChange("name", event.target.value);
            }}
            label={"Name *"}
        />
        <TextField
            fullWidth
            type="text"
            onChange={(event) => {
                handlePropertyChange("shortName", event.target.value);
            }}
            value={localTeam.shortName}
            label={"Kürzel *"}
        />
        <Divider />
        <Button fullWidth onClick={handleSubmit} variant="contained" color={"primary"}>Speichern</Button>
        <Button fullWidth onClick={() => closeModal()} variant="outlined" color={"error"}>Abbrechen</Button>
    </Stack>;
};

export default TeamForm;