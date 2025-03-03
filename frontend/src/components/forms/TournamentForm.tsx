import React, {useContext} from "react";
import {
    Stack,
    Divider, FormControlLabel, Switch,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Loader from "../Loader";
import TournamentResponse from "../../types/response/TournamentResponse";
import useTournaments from "../../hook/useTournaments";
import TournamentRequest from "../../types/request/TournamentRequest";
import {NotificationContext} from "../../context/NotificationContext";
import Ajv, {ErrorObject} from "ajv";
import ajvErrors from "ajv-errors";
import TournamentSchema from "../../schemas/Tournament";

type TournamentProps = {
    tournament?: TournamentResponse;
    closeModal: (error?: boolean) => void;
}

const TournamentForm: React.FC<TournamentProps> = (props) => {
    const {tournament, closeModal} = props;

    const ajv = new Ajv({allErrors: true});
    ajvErrors(ajv);
    const validate = ajv.compile(TournamentSchema);

    const tournamentApi = useTournaments();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { setNotification } = useContext(NotificationContext);

    const [localTournament, setLocalTournament] = React.useState<TournamentRequest>(
        tournament ? {
            id: tournament.id,
            name: tournament.name,
            tendingBetScore: tournament.tendingBetScore,
            correctBetScore: tournament.correctBetScore,
            gameEndScore: tournament.gameEndScore,
            finalBetScore: tournament.finalBetScore,
            isActive: tournament.isActive,
        } : {
            name: "",
            tendingBetScore: 0,
            correctBetScore: 0,
            gameEndScore: 0,
            finalBetScore: 0,
            isActive: false,
        }
    );

    const handlePropertyChange = React.useCallback(
        <Key extends keyof TournamentRequest>(key: Key, value: TournamentRequest[Key]) => {
            setLocalTournament((current) => ({ ...current, [key]: value }));
        },
        [],
    );

    const handleSubmit = () => {
        if (validate(localTournament)) {
            if(tournament) {
                tournamentApi.postData(tournament.id, localTournament).then(() => {
                    setIsLoading(false);
                    closeModal(false);
                }).catch(() => {
                    setIsLoading(false);
                    closeModal(true);
                });
            } else {
                tournamentApi.putData(localTournament).then(() => {
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
        <Divider>TURNIER</Divider>
        <TextField
            fullWidth
            type="text"
            value={localTournament.name}
            onChange={(event) => {
                handlePropertyChange("name", event.target.value);
            }}
            label={"Name *"}
        />
        {!localTournament.isActive && (
            <FormControlLabel control={
                <Switch
                    onChange={(event) => {
                        handlePropertyChange("isActive", event.target.checked);
                    }}
                    checked={localTournament.isActive}
                />
            } label="aktiv"
            />
        )}
        <Divider />
        <TextField
            fullWidth
            type="number"
            value={localTournament.tendingBetScore}
            onChange={(event) => {
                handlePropertyChange("tendingBetScore", Math.max(parseInt(event.target.value), 0));
            }}
            label={"Punkte für tendenziell richtige Tipps *"}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <TextField
            fullWidth
            type="number"
            value={localTournament.correctBetScore}
            onChange={(event) => {
                handlePropertyChange("correctBetScore", Math.max(parseInt(event.target.value), 0));
            }}
            label={"Punkte für korrekte Tipps *"}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <TextField
            fullWidth
            type="number"
            value={localTournament.gameEndScore}
            onChange={(event) => {
                handlePropertyChange("gameEndScore", Math.max(parseInt(event.target.value), 0));
            }}
            label={"Punkte für korrektes Spielende *"}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <TextField
            fullWidth
            type="number"
            value={localTournament.finalBetScore}
            onChange={(event) => {
                handlePropertyChange("finalBetScore", Math.max(parseInt(event.target.value), 0));
            }}
            label={"Punkte für Finaltipp *"}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <Divider />
        <Button fullWidth onClick={handleSubmit} variant="contained" color={"primary"}>Speichern</Button>
        <Button fullWidth onClick={() => closeModal()} variant="outlined" color={"error"}>Abbrechen</Button>
    </Stack>;
};

export default TournamentForm;