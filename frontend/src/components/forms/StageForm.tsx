import React, {useContext} from "react";
import {
    Stack,
    Divider, FormLabel, RadioGroup, FormControlLabel, Radio,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Loader from "../Loader";
import StageResponse from "../../types/response/StageResponse";
import StageRequest from "../../types/request/StageRequest";
import useStages from "../../hook/useStages";
import {TournamentContext} from "../../context/TournamentContext";
import Ajv, {ErrorObject} from "ajv";
import StageSchema from "../../schemas/Stage";
import {NotificationContext} from "../../context/NotificationContext";
import ajvErrors from "ajv-errors";

type TeamProps = {
    stage?: StageResponse;
    closeModal: (error?: boolean) => void;
}

const StageForm: React.FC<TeamProps> = (props) => {
    const {stage, closeModal} = props;

    const ajv = new Ajv({allErrors: true});
    ajvErrors(ajv);
    const validate = ajv.compile(StageSchema);

    const stageApi = useStages();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { tournament: storedTournament } = useContext(TournamentContext);
    const { setNotification } = useContext(NotificationContext);

    const [localStage, setLocalStage] = React.useState<StageRequest>(
        stage ? {
            id: stage.id,
            name: stage.name,
            isGrandFinal: stage.isGrandFinal,
            isFinal: stage.isFinal,
            tournament: storedTournament.id
        } : {
            name: "",
            isGrandFinal: false,
            isFinal: false,
            tournament: storedTournament.id
        }
    );

    const handlePropertyChange = React.useCallback(
        <Key extends keyof StageRequest>(key: Key, value: StageRequest[Key]) => {
            setLocalStage((current) => ({ ...current, [key]: value }));
        },
        [],
    );

    const handleSubmit = () => {
        if (validate(localStage)) {
            if(stage) {
                stageApi.postData(stage.id, localStage).then(() => {
                    setIsLoading(false);
                    closeModal(false);
                }).catch(() => {
                    setIsLoading(false);
                    closeModal(true);
                });
            } else {
                stageApi.putData(localStage).then(() => {
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

    const getValue = () => {
        if(localStage.isFinal) {
            return "1";
        }
        if(localStage.isGrandFinal) {
            return "2";
        }
        return "0";
    };

    if(isLoading) {
        return <Loader />;
    }

    return <Stack sx={{padding: "2em", backgroundColor: "rgb(20,20,20)"}} justifyContent="center" alignItems="center" spacing={2} direction={"column"}>
        <Divider>GRUPPE</Divider>
        <TextField
            fullWidth
            type="text"
            value={localStage.name}
            onChange={(event) => {
                handlePropertyChange("name", event.target.value);
            }}
            label={"Name *"}
        />
        <FormLabel id="stage-label">Turnierphase *</FormLabel>
        <RadioGroup
            aria-labelledby="stage-label"
            name="stage-label"
            value={getValue()}
            onChange={(event) => {
                if(event.target.value === "0") {
                    handlePropertyChange("isFinal", false);
                    handlePropertyChange("isGrandFinal", false);
                }
                if(event.target.value === "1") {
                    handlePropertyChange("isFinal", true);
                    handlePropertyChange("isGrandFinal", false);
                }
                if(event.target.value === "2") {
                    handlePropertyChange("isFinal", false);
                    handlePropertyChange("isGrandFinal", true);
                }
            }}
        >
            <FormControlLabel value={"0"} control={<Radio />} label="Vorrunde" />
            <FormControlLabel value={"1"} control={<Radio />} label="KO-Runde" />
            <FormControlLabel value={"2"} control={<Radio />} label="Finale" />
        </RadioGroup>
        <Divider />
        <Button fullWidth onClick={handleSubmit} variant="contained" color={"primary"}>Speichern</Button>
        <Button fullWidth onClick={() => closeModal()} variant="outlined" color={"error"}>Abbrechen</Button>
    </Stack>;
};

export default StageForm;