import React, {useContext} from "react";
import {
    Stack,
    Divider,
    Select,
    MenuItem,
    InputLabel,
    SelectChangeEvent,
    Alert
} from "@mui/material";
import Button from "@mui/material/Button";
import useAuth from "../../hook/useAuth";
import useUsers from "../../hook/useUsers";
import UserResponse from "../../types/response/UserResponse";
import Loader from "../Loader";
import FinalsBetRequest from "../../types/request/FinalsBetRequest";
import FinalsBetResponse from "../../types/response/FinalsBetResponse";
import {TournamentContext} from "../../context/TournamentContext";
import TeamResponse from "../../types/response/TeamResponse";
import useTeams from "../../hook/useTeams";
import useFinalsBets from "../../hook/useFinalsBets";
import Avatar from "@mui/material/Avatar";
import {NotificationContext} from "../../context/NotificationContext";
import Ajv, {ErrorObject} from "ajv";
import ajvErrors from "ajv-errors";
import FinalsBetSchema from "../../schemas/FinalsBet";
import GameResponse from "../../types/response/GameResponse";

type FinalsBetProps = {
    finalsBet?: FinalsBetResponse;
    closeModal: (error?: boolean) => void;
    withUser?: boolean;
}

const FinalsBetForm: React.FC<FinalsBetProps> = (props) => {
    const {finalsBet, closeModal, withUser = false} = props;

    const ajv = new Ajv({allErrors: true});
    ajvErrors(ajv);
    const validate = ajv.compile(FinalsBetSchema);

    const { tournament: storedTournament } = useContext(TournamentContext);
    const auth = useAuth();
    const userApi = useUsers();
    const teamsApi = useTeams();
    const finalsBetApi = useFinalsBets();
    const [users, setUsers] = React.useState<UserResponse[]>([]);
    const [teams, setTeams] = React.useState<TeamResponse[]>([]);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const { setNotification } = useContext(NotificationContext);

    const [localFinalsBet, setLocalFinalsBet] = React.useState<FinalsBetRequest>(
        finalsBet ? {
            id: finalsBet.id,
            teamGuest: finalsBet.teamGuest.id,
            teamHome: finalsBet.teamHome.id,
            tournament: finalsBet.tournament.id,
            user: auth.getUser()?.id
        } : {
            teamGuest: 0,
            teamHome: 0,
            tournament: storedTournament.id,
            user: auth.getUser()?.id
        }
    );

    React.useEffect(() => {
        teamsApi.getData(storedTournament.id).then((teams:TeamResponse[]) => {
            setTeams(
                teams
                    .filter((team: TeamResponse) => team.shortName.toLowerCase() !== "xxx")
                    .filter((team: TeamResponse) => {
                        return team.games.filter((game: GameResponse) => game.tournament.id === storedTournament.id).length > 0;
                    })
                    .sort((a: TeamResponse, b: TeamResponse) => a.name.localeCompare(b.name))
            );

            if(!localFinalsBet.id) {
                setLocalFinalsBet(
                    {
                        ...localFinalsBet,
                        teamHome: teams.find(() => true)?.id as number,
                        teamGuest: teams.find(() => true)?.id as number
                    }
                );
            }

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
        }).catch((status: number) => {
            setErrorCode(status);
            setIsLoading(false);
        });
    }, []);

    const handlePropertyChange = React.useCallback(
        <Key extends keyof FinalsBetRequest>(key: Key, value: FinalsBetRequest[Key]) => {
            setLocalFinalsBet((current) => ({ ...current, [key]: value }));
        },
        [],
    );

    const handleSubmit = () => {
        if (validate(localFinalsBet)) {
            if(finalsBet) {
                finalsBetApi.postData(finalsBet.id, localFinalsBet).then(() => {
                    setIsLoading(false);
                    closeModal(false);
                }).catch(() => {
                    setIsLoading(false);
                    closeModal(true);
                });
            } else {
                finalsBetApi.putData(localFinalsBet).then(() => {
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
        <Divider>FINALTIPP</Divider>
        <Alert sx={{width: "auto", marginBottom: "1em"}} severity="info">Die Reihenfolge der Finalisten spielt keine Rolle bei der Punktevergabe. Du kannst auch zwei mal die selbe Mannschaft auswählen und so die volle Punktzahl bei Finaleinzug dieser Mannschaft erhalten.</Alert>
        <>
            <InputLabel id="team-home-label">Erster Finalist *</InputLabel>
            <Select
                onChange={(event) => {
                    handlePropertyChange("teamHome", event.target.value as number);
                }}
                fullWidth
                value={localFinalsBet.teamHome}
                labelId="team-home-label"
                sx={{"& > div": {display: "flex"}}}
            >
                {teams.map((team: TeamResponse) => {
                    return <MenuItem key={`team-id-${team.id}`} value={team.id}>
                        <Avatar sx={{ width: 24, height: 24, marginRight: "1em" }} src={`/assets/flags/${team.shortName.toLowerCase()}.png`} />
                        {team.name.length > 10 ? team.name.substring(0, 10) + "\u2026" : team.name}
                    </MenuItem>;
                })}
            </Select>
        </>
        <>
            <InputLabel id="team-guest-label">Zweiter Finalist *</InputLabel>
            <Select
                onChange={(event) => {
                    handlePropertyChange("teamGuest", event.target.value as number);
                }}
                fullWidth
                value={localFinalsBet.teamGuest}
                labelId="team-guest-label"
                sx={{"& > div": {display: "flex"}}}
            >
                {teams.map((team: TeamResponse) => {
                    return <MenuItem key={`team-id-${team.id}`} value={team.id} sx={{display: "flex"}}>
                        <Avatar sx={{ width: 24, height: 24, marginRight: "1em" }} src={`/assets/flags/${team.shortName.toLowerCase()}.png`} />
                        {team.name.length > 10 ? team.name.substring(0, 10) + "\u2026" : team.name}
                    </MenuItem>;
                })}
            </Select>
        </>
        <Divider />
        {auth.getUser()?.isAdmin && withUser && (
            <>
                <InputLabel id="user-label">Nutzer *</InputLabel>
                <Select
                    labelId="user-label"
                    fullWidth
                    onChange={(event: SelectChangeEvent<number>) => {
                        handlePropertyChange("user", event.target.value as number);
                    }}
                    value={localFinalsBet.user}
                >
                    {
                        users.map((user: UserResponse) => {
                            return <MenuItem key={`user-option-${user.id}`} value={user.id}>{user.name}</MenuItem>;
                        })
                    }
                </Select>
                <Divider />
            </>
        )}
        <Button fullWidth onClick={handleSubmit} variant="contained" color={"primary"}>Speichern</Button>
        <Button fullWidth onClick={() => closeModal()} variant="outlined" color={"error"}>Abbrechen</Button>
    </Stack>;
};

export default FinalsBetForm;