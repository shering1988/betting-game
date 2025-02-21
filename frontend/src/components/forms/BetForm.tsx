import React, {useContext} from "react";
import {
    Stack,
    Typography,
    Divider,
    Select,
    MenuItem,
    InputLabel,
    SelectChangeEvent, IconButton, Alert,
} from "@mui/material";
import GameResponse from "../../types/response/GameResponse";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import BetResponse from "../../types/response/BetResponse";
import translateGameEnd from "../../helpers/translateGameEnd";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import AvatarGroup from "@mui/material/AvatarGroup";
import useAuth from "../../hook/useAuth";
import BetRequest from "../../types/request/BetRequest";
import useUsers from "../../hook/useUsers";
import UserResponse from "../../types/response/UserResponse";
import Loader from "../Loader";
import useBets from "../../hook/useBets";
import Ajv, {ErrorObject} from "ajv";
import ajvErrors from "ajv-errors";
import BetSchema from "../../schemas/Bet";
import {NotificationContext} from "../../context/NotificationContext";
import {AddCircle, RemoveCircle} from "@mui/icons-material";
import {TournamentContext} from "../../context/TournamentContext";

type BetProps = {
    game: GameResponse;
    bet?: BetResponse;
    closeModal: (error?: boolean) => void;
    withUser?: boolean;
}

const BetForm: React.FC<BetProps> = (props) => {
    const {game, closeModal, bet, withUser = false} = props;

    const ajv = new Ajv({allErrors: true});
    ajvErrors(ajv);
    const validate = ajv.compile(BetSchema);

    const { tournament: storedTournament } = useContext(TournamentContext);
    const auth = useAuth();
    const userApi = useUsers();
    const betApi = useBets();
    const date = new Date(game.start);
    const dateString = date.toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit", year: "numeric"});
    const timeString = date.toLocaleTimeString("de-DE", {hour: "2-digit", minute: "2-digit"});
    const [users, setUsers] = React.useState<UserResponse[]>([]);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const { setNotification } = useContext(NotificationContext);

    const [localBet, setLocalBet] = React.useState<BetRequest>(
        bet ? {
            id: bet.id,
            game: bet.game.id,
            teamGuestScore: bet.teamGuestScore,
            teamHomeScore: bet.teamHomeScore,
            gameEnd: bet.gameEnd,
            user: auth.getUser()?.id
        } : {
            game: game.id,
            teamGuestScore: 0,
            teamHomeScore: 0,
            gameEnd: "regular",
            user: auth.getUser()?.id
        }
    );

    React.useEffect(() => {
        if(withUser) {
            userApi.getData(storedTournament.id).then((users:UserResponse[]) => {
                setUsers(users);
                setIsLoading(false);
            }).catch((status: number) => {
                setErrorCode(status);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const handlePropertyChange = React.useCallback(
        <Key extends keyof BetRequest>(key: Key, value: BetRequest[Key]) => {
            setLocalBet((current) => ({ ...current, [key]: value }));
        },
        [],
    );

    const handleSubmit = () => {
        if (validate(localBet)) {
            if(bet) {
                betApi.postData(bet.id, localBet).then(() => {
                    setIsLoading(false);
                    closeModal(false);
                }).catch(() => {
                    setIsLoading(false);
                    closeModal(true);
                });
            } else {
                betApi.putData(localBet).then(() => {
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
        <Divider>TIPPABGABE</Divider>
        <Box sx={{display: "flex", justifyContent: "center"}}>
            <AvatarGroup max={2}>
                <Avatar sx={{filter: "grayscale(0.5)"}} src={`/assets/flags/${game.teamHome.shortName.toLowerCase()}.png`} />
                <Avatar sx={{filter: "grayscale(0.5)"}} src={`/assets/flags/${game.teamGuest.shortName.toLowerCase()}.png`} />
            </AvatarGroup>
        </Box>
        <Typography sx={{textAlign: "center"}} component="div" variant="h6">
            {game.teamHome.name} gegen {game.teamGuest.name}
        </Typography>
        <Typography sx={{textAlign: "center"}} variant="subtitle1" color="text.secondary" component="div">
            {`${dateString} um ${timeString} Uhr`}
        </Typography>
        <Typography sx={{textAlign: "center"}} variant="subtitle1" color="text.secondary" component="div">
            {game.stage.name}
        </Typography>
        <Divider />
        <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
            <IconButton
                aria-label="less"
                onClick={
                    () => {
                        handlePropertyChange("teamHomeScore", Math.max(0, localBet.teamHomeScore - 1));
                    }
                }
                sx={{height:"40px",width:"40px", mt: "0.3em", mr: "0.5em"}}
            >
                <RemoveCircle sx={{height:"40px",width:"40px"}} color={"primary"} />
            </IconButton>
            <TextField
                fullWidth
                type="number"
                value={localBet.teamHomeScore}
                onChange={(event) => {
                    handlePropertyChange("teamHomeScore", Math.max(parseInt(event.target.value), 0));
                }}
                label={`Tore für ${game.teamHome.name} *`}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0, max: 15 }}
            />
            <IconButton
                aria-label="more"
                onClick={
                    () => {
                        handlePropertyChange("teamHomeScore", Math.min(15, localBet.teamHomeScore + 1));
                    }
                }
                sx={{height:"40px",width:"40px", mt: "0.3em", ml: "0.5em"}}
            >
                <AddCircle sx={{height:"40px",width:"40px"}} color={"primary"} />
            </IconButton>
        </div>
        <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
            <IconButton
                aria-label="less"
                onClick={
                    () => {
                        handlePropertyChange("teamGuestScore", Math.max(0, localBet.teamGuestScore - 1));
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
                    handlePropertyChange("teamGuestScore", Math.max(parseInt(event.target.value), 0));
                }}
                value={localBet.teamGuestScore}
                label={`Tore für ${game.teamGuest.name} *`}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0, max: 15 }}
            />
            <IconButton
                aria-label="more"
                onClick={
                    () => {
                        handlePropertyChange("teamGuestScore", Math.min(15, localBet.teamGuestScore + 1));
                    }
                }
                sx={{height:"40px",width:"40px", mt: "0.3em", ml: "0.5em"}}
            >
                <AddCircle sx={{height:"40px",width:"40px"}} color={"primary"} />
            </IconButton>
        </div>
        {
            ((game.stage.isFinal || game.stage.isGrandFinal) && localBet.teamHomeScore === localBet.teamGuestScore) && (
                <Alert severity="info">
                    {"Dies ist ein Spiel aus der KO-Phase, ein Unentschieden kann nicht eintreten."}
                </Alert>
            )
        }
        {(game.stage.isFinal || game.stage.isGrandFinal) && (
            <>
                <InputLabel id="game-end-label">Spielende *</InputLabel>
                <Select
                    fullWidth
                    onChange={(event) => {
                        handlePropertyChange("gameEnd", event.target.value);
                    }}
                    labelId="game-end-label"
                    defaultValue={localBet.gameEnd ?? "regular"}
                >
                    <MenuItem value={"regular"}>{translateGameEnd("regular")}</MenuItem>
                    <MenuItem value={"overtime"}>{translateGameEnd("overtime")}</MenuItem>
                    <MenuItem value={"penalty"}>{translateGameEnd("penalty")}</MenuItem>
                </Select>
            </>
        )}
        {auth.getUser()?.isAdmin && withUser && (
            <>
                <InputLabel id="user-label">Nutzer *</InputLabel>
                <Select
                    fullWidth
                    labelId="user-label"
                    onChange={(event: SelectChangeEvent<number>) => {
                        handlePropertyChange("user", event.target.value as number);
                    }}
                    value={localBet.user}
                >
                    {
                        users.map((user: UserResponse) => {
                            return <MenuItem key={`user-option-${user.id}`} value={user.id}>{user.name}</MenuItem>;
                        })
                    }
                </Select>
            </>
        )}
        <Divider />
        {
            (localBet.gameEnd === "penalty") && (
                <Alert severity="info">
                    {"Wenn du auf ein Elfmeterschiessen tippst, beachte bitte, dass als Endergebnis die Tore aus der regulären Spielzeit mit den Toren aus dem Elfmeterschiessen addiert werden."}
                </Alert>
            )
        }
        <Button fullWidth onClick={handleSubmit} variant="contained" color={"primary"}>Speichern</Button>
        <Button fullWidth onClick={() => closeModal()} variant="outlined" color={"error"}>Abbrechen</Button>
    </Stack>;
};

export default BetForm;