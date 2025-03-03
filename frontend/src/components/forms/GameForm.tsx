import React, {useContext} from "react";
import {
    Stack,
    Divider,
    Select,
    MenuItem,
    InputLabel, IconButton,
} from "@mui/material";
import Button from "@mui/material/Button";
import Loader from "../Loader";
import {TournamentContext} from "../../context/TournamentContext";
import TeamResponse from "../../types/response/TeamResponse";
import useTeams from "../../hook/useTeams";
import Avatar from "@mui/material/Avatar";
import GameResponse from "../../types/response/GameResponse";
import GameRequest from "../../types/request/GameRequest";
import useGames from "../../hook/useGames";
import TextField from "@mui/material/TextField";
import translateGameEnd from "../../helpers/translateGameEnd";
import {MobileDateTimePicker} from "@mui/x-date-pickers";
import useStages from "../../hook/useStages";
import StageResponse from "../../types/response/StageResponse";
import dayjs from "dayjs";
import Ajv, {ErrorObject} from "ajv";
import {NotificationContext} from "../../context/NotificationContext";
import ajvErrors from "ajv-errors";
import GameSchema from "../../schemas/Game";
import {AddCircle, RemoveCircle} from "@mui/icons-material";

type GameProps = {
    game?: GameResponse;
    closeModal: (error?: boolean) => void;
}

const GameForm: React.FC<GameProps> = (props) => {
    const {game, closeModal} = props;

    const ajv = new Ajv({allErrors: true});
    ajvErrors(ajv);
    const validate = ajv.compile(GameSchema);

    const { tournament: storedTournament } = useContext(TournamentContext);
    const teamsApi = useTeams();
    const gamesApi = useGames();
    const stagesApi = useStages();
    const [teams, setTeams] = React.useState<TeamResponse[]>([]);
    const [stages, setStages] = React.useState<StageResponse[]>([]);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const { setNotification } = useContext(NotificationContext);

    const formatValue = (bufferDate: Date) => {
        return `${bufferDate.getDate().toString().padStart(2, "0")}.${(bufferDate.getMonth() +1).toString().padStart(2, "0")}.${bufferDate.getFullYear()} ${bufferDate.getHours().toString().padStart(2, "0")}:${bufferDate.getMinutes().toString().padStart(2, "0")}`;
    };

    const [localGame, setLocalGame] = React.useState<GameRequest>(
        game ? {
            id: game.id,
            teamGuest: game.teamGuest.id,
            teamHome: game.teamHome.id,
            tournament: game.tournament.id,
            stage: game.stage.id,
            start: formatValue(new Date(game.start)),
            gameEnd: game.gameEnd,
            scoreTeamHome: game.scoreTeamHome,
            scoreTeamGuest: game.scoreTeamGuest,
        } : {
            teamGuest: 0,
            teamHome: 0,
            tournament: storedTournament.id,
            stage: 0,
            start: formatValue(new Date()),
            gameEnd: null,
            scoreTeamHome: null,
            scoreTeamGuest: null,
        }
    );

    React.useEffect(() => {
        teamsApi.getData(storedTournament.id).then((teams:TeamResponse[]) => {
            setTeams(teams.sort((a: TeamResponse, b: TeamResponse) => a.name.localeCompare(b.name)));

            stagesApi.getData(storedTournament.id).then((stages:StageResponse[]) => {
                if(!localGame.id) {
                    setLocalGame(
                        {
                            ...localGame,
                            teamHome: teams.find(() => true)?.id as number,
                            teamGuest: teams.find(() => true)?.id as number,
                            stage: stages.find(() => true)?.id as number
                        }
                    );
                }

                setStages(stages.sort((a: StageResponse, b: StageResponse) => a.name.localeCompare(b.name)));
                setIsLoading(false);
            }).catch((status: number) => {
                setErrorCode(status);
                setIsLoading(false);
            });
        }).catch((status: number) => {
            setErrorCode(status);
            setIsLoading(false);
        });
    }, []);

    const handlePropertyChange = React.useCallback(
        <Key extends keyof GameRequest>(key: Key, value: GameRequest[Key]) => {
            setLocalGame((current) => ({ ...current, [key]: value }));
        },
        [],
    );

    const handleSubmit = () => {
        if (validate(localGame)) {
            if(game) {
                gamesApi.postData(game.id, localGame).then(() => {
                    setIsLoading(false);
                    closeModal(false);
                }).catch(() => {
                    setIsLoading(false);
                    closeModal(true);
                });
            } else {
                gamesApi.putData(localGame).then(() => {
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

    if(errorCode && !isLoading) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    return <Stack sx={{padding: "2em", backgroundColor: "rgb(20,20,20)"}} justifyContent="center" alignItems="center" spacing={2} direction={"column"}>
        <Divider>SPIEL</Divider>
        <MobileDateTimePicker
            disablePast={true}
            ampm={false}
            label="Anstoßsszeit"
            format={"DD.MM.YYYY HH:mm"}
            viewRenderers={{
                seconds: null
            }}
            slotProps={{
                textField: {
                    required: true,
                    fullWidth: true,
                    value: localGame.start.indexOf("T") < 0 ? dayjs(localGame.start, "DD.MM.YYYY HH:mm") : dayjs(localGame.start)
                },
            }}
            onChange={(value: string | null) => {
                if(value) {
                    const bufferDate = new Date(value);
                    if(bufferDate) {
                        handlePropertyChange(
                            "start",
                            formatValue(bufferDate)
                        );
                    }
                }
            }}
            views={["day", "hours", "minutes", "month", "year"]}
        />
        <>
            <InputLabel id="stage-label">Gruppe *</InputLabel>
            <Select
                onChange={(event) => {
                    handlePropertyChange("stage", event.target.value as number);
                }}
                fullWidth
                value={localGame.stage === 0 ? "" : localGame.stage}
                labelId="stage-label"
                sx={{"& > div": {display: "flex"}}}
            >
                {stages.map((stage: StageResponse) => {
                    return <MenuItem key={`team-id-${stage.id}`} value={stage.id}>
                        {stage.name}
                    </MenuItem>;
                })}
            </Select>
        </>
        <Divider />
        <>
            <InputLabel id="team-home-label">Heimmannschaft *</InputLabel>
            <Select
                onChange={(event) => {
                    handlePropertyChange("teamHome", event.target.value as number);
                }}
                fullWidth
                value={localGame.teamHome}
                labelId="team-home-label"
                sx={{"& > div": {display: "flex"}}}
            >
                {teams.map((team: TeamResponse) => {
                    return <MenuItem key={`team-id-${team.id}`} value={team.id}>
                        <Avatar sx={{ width: 24, height: 24, marginRight: "1em" }} src={`/assets/flags/${team.shortName.toLowerCase()}.png`} />
                        {team.name}
                    </MenuItem>;
                })}
            </Select>
        </>
        <>
            <InputLabel id="team-guest-label">Auswärtsmannschaft *</InputLabel>
            <Select
                onChange={(event) => {
                    handlePropertyChange("teamGuest", event.target.value as number);
                }}
                fullWidth
                value={localGame.teamGuest}
                labelId="team-guest-label"
                sx={{"& > div": {display: "flex"}}}
            >
                {teams.map((team: TeamResponse) => {
                    return <MenuItem key={`team-id-${team.id}`} value={team.id} sx={{display: "flex"}}>
                        <Avatar sx={{ width: 24, height: 24, marginRight: "1em" }} src={`/assets/flags/${team.shortName.toLowerCase()}.png`} />
                        {team.name}
                    </MenuItem>;
                })}
            </Select>
        </>
        <Divider />

        <div style={{display: "flex", flexDirection: "row"}}>
            <IconButton
                aria-label="less"
                onClick={
                    () => {
                        handlePropertyChange("scoreTeamHome", Math.max(0, (localGame.scoreTeamHome ?? 0) - 1));
                    }
                }
                sx={{height:"40px",width:"40px", mt: "0.3em", mr: "0.5em"}}
            >
                <RemoveCircle sx={{height:"40px",width:"40px"}} color={"primary"} />
            </IconButton>
            <TextField
                fullWidth
                type="number"
                value={localGame.scoreTeamHome ?? ""}
                onChange={(event) => {
                    handlePropertyChange("scoreTeamHome", Math.max(parseInt(event.target.value), 0));
                }}
                label={"Tore für Heimmannschaft"}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
            <IconButton
                aria-label="more"
                onClick={
                    () => {
                        handlePropertyChange("scoreTeamHome", Math.min(15, (localGame.scoreTeamHome ?? 0) + 1));
                    }
                }
                sx={{height:"40px",width:"40px", mt: "0.3em", ml: "0.5em"}}
            >
                <AddCircle sx={{height:"40px",width:"40px"}} color={"primary"} />
            </IconButton>
        </div>
        <div style={{display: "flex", flexDirection: "row"}}>
            <IconButton
                aria-label="less"
                onClick={
                    () => {
                        handlePropertyChange("scoreTeamGuest", Math.max(0, (localGame.scoreTeamGuest ?? 0) - 1));
                    }
                }
                sx={{height:"40px",width:"40px", mt: "0.3em", mr: "0.5em"}}
            >
                <RemoveCircle sx={{height:"40px",width:"40px"}} color={"primary"} />
            </IconButton>
            <TextField
                fullWidth
                type="number"
                onChange={(event) => {
                    handlePropertyChange("scoreTeamGuest", Math.max(parseInt(event.target.value), 0));
                }}
                value={localGame.scoreTeamGuest ?? ""}
                label={"Tore für Auswärtsmannschaft"}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
            <IconButton
                aria-label="more"
                onClick={
                    () => {
                        handlePropertyChange("scoreTeamGuest", Math.min(15, (localGame.scoreTeamGuest ?? 0) + 1));
                    }
                }
                sx={{height:"40px",width:"40px", mt: "0.3em", ml: "0.5em"}}
            >
                <AddCircle sx={{height:"40px",width:"40px"}} color={"primary"} />
            </IconButton>
        </div>
        <>
            <InputLabel id="game-end-label">Spielende</InputLabel>
            <Select
                onChange={(event) => {
                    handlePropertyChange("gameEnd", event.target.value as "penalty" | "overtime" | "regular");
                }}
                fullWidth
                labelId="game-end-label"
                defaultValue={localGame.gameEnd ?? undefined}
            >
                <MenuItem value={undefined}></MenuItem>
                <MenuItem value={"regular"}>{translateGameEnd("regular")}</MenuItem>
                <MenuItem value={"overtime"}>{translateGameEnd("overtime")}</MenuItem>
                <MenuItem value={"penalty"}>{translateGameEnd("penalty")}</MenuItem>
            </Select>
        </>
        <Button fullWidth onClick={handleSubmit} variant="contained" color={"primary"}>Speichern</Button>
        <Button fullWidth onClick={() => closeModal()} variant="outlined" color={"error"}>Abbrechen</Button>
    </Stack>;
};

export default GameForm;