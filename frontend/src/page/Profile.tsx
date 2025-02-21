import React, {useContext} from "react";
import {Alert, Card, CardMedia, CircularProgress, Divider, FormControlLabel, Switch, Typography} from "@mui/material";
import NoProfileImage from "../assets/no-profile-image.png";
import Box from "@mui/material/Box";
import UserResponse from "../types/response/UserResponse";
import useUsers from "../hook/useUsers";
import useAuth from "../hook/useAuth";
import Loader from "../components/Loader";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {NotificationContext} from "../context/NotificationContext";
import UserRequest from "../types/request/UserRequest";
import Ajv, {ErrorObject} from "ajv";
import ajvErrors from "ajv-errors";
import ProfileSchema from "../schemas/Profile";
import {TournamentContext} from "../context/TournamentContext";

const Profile: React.FC = () => {
    const auth = useAuth();
    const usersApi = useUsers();
    const { tournament: storedTournament } = useContext(TournamentContext);

    const ajv = new Ajv({allErrors: true});
    ajvErrors(ajv);
    const validate = ajv.compile(ProfileSchema);

    const [user, setUser] = React.useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [hasChanged, setHasChanged] = React.useState<number>(0);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const { setNotification } = useContext(NotificationContext);

    const [localUser, setLocalUser] = React.useState<UserRequest>({
        name: "",
        password: undefined,
        passwordRepeat: undefined,
        reminder: false
    });

    React.useEffect(() => {
        usersApi.getData(storedTournament.id, auth.getUser()?.id).then((users:UserResponse[]) => {
            setUser(users[0]);
            setLocalUser({
                name: users[0].name,
                password: undefined,
                passwordRepeat: undefined,
                reminder: users[0].sendReminder
            });
            setIsLoading(false);
        }).catch((status: number) => {
            setErrorCode(status);
            setIsLoading(false);
        });
    }, [hasChanged]);

    const handleSubmit = () => {
        setIsSubmitting(true);

        if (validate(localUser)) {
            usersApi.postData(user?.id as number, localUser).then(() => {
                setNotification({type: "success", message: "Dein Profil wurde aktualisiert."});
                setIsSubmitting(false);
                setHasChanged(hasChanged + 1);
            }).catch((status) => {
                if(status === 409) {
                    setNotification({type: "error", message: "Die eingegebenen Passwörter waren nicht identisch."});
                } else {
                    setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
                }
                setIsSubmitting(false);
                setHasChanged(hasChanged + 1);
            });
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
            setIsSubmitting(false);
        }
    };

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.files) {
            setIsLoading(true);
            usersApi.uploadProfileImage(auth.getUser()?.id as number, event.target.files[0]).then(() => {
                setHasChanged(hasChanged + 1);
                setNotification({type: "success", message: "Dein Profilbild wurde aktualisiert."});
                setIsLoading(false);
            }).catch((status: number) => {
                if(status === 400) {
                    setNotification({type: "error", message: "Ungültiges Bild: bitte beachte die Vorgaben (nur JPG, PNG, GIF bei max. 8 MB Dateigröße)"});
                } else {
                    setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
                }
                setIsLoading(false);
            });
        }
    };

    if(errorCode && !isLoading) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(!user || isLoading) {
        return <Loader />;
    }

    return <>
        <Card
            variant="outlined"
            sx={{
                display: "flex",
                p: 1,
                flexDirection: {
                    xs: "column",
                    sm: "row",
                },
                borderBottom: "2px solid #666666",
                marginBottom: "1em",
                justifyContent: {
                    xs: "center",
                    sm: "space-between"
                },
                backgroundColor: "rgba(255, 255, 255, 0.05)"
            }}
        >
            <Box style={{display: "flex", justifyContent: "space-between", width: "100%", flexWrap: "wrap"}}>
                <Box sx={{ width: "100%", alignSelf: "center", justifyContent: { xs: "center", sm: "left" } }}>
                    <Typography variant="h6" component="div" fontWeight="bold" sx={{ display: "flex", justifyContent: { xs: "center", sm: "left" } }}>
                        {user.name}
                    </Typography>
                    <Typography variant="body2" color="secondary" sx={{ display: "flex", justifyContent: { xs: "center", sm: "left" } }}>
                        {user.email}
                    </Typography>
                </Box>
            </Box>
        </Card>
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>EINSTELLUNGEN</Divider>
        <Card
            variant="outlined"
            sx={{
                display: "flex",
                p: 1,
                flexDirection: {
                    xs: "column",
                    sm: "row",
                },
                borderBottom: "2px solid #666666",
                marginBottom: "1em",
                justifyContent: {
                    xs: "center",
                    sm: "space-between"
                },
                backgroundColor: "rgba(255, 255, 255, 0.05)"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: {xs: "column", sm: "row",},
                    justifyContent: "space-between",
                    width: "100%",
                    flexWrap: "wrap"
                }}
            >
                <Box
                    sx={{
                        padding: "0.5em",
                        width: { xs: "100%", sm: "30%" },
                        alignItems: "center",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start"
                    }}
                >
                    <CardMedia
                        component="img"
                        alt={`Profilbild von ${user.name}`}
                        src={user.profileImage ? user.profileImage.path : NoProfileImage}
                        sx={{
                            borderRadius: 0.5,
                            width: "100%",
                            maxHeight: { xs: 150, sm: "100%" },
                            mr: { sm: 1.5 },
                            mb: { xs: 1.5, sm: 0 },
                        }}
                    />
                    <div>
                        <input
                            accept="image/*"
                            style={{ display: "none" }}
                            id="raised-button-file"
                            type="file"
                            hidden
                            onChange={handleUpload}
                        />
                        <label htmlFor="raised-button-file">
                            <Button sx={{marginTop: "1em"}} fullWidth={true} variant="outlined" component="span">
                                Bild hochladen
                            </Button>
                        </label>
                        <Typography variant="body2" color="secondary" sx={{ marginTop: "1em",display: "flex", justifyContent: { xs: "center", sm: "left" } }}>
                            JPG, PNG, GIF, max. 8MB
                        </Typography>
                    </div>
                </Box>
                <Box component="form" sx={{width: { xs: "100%", sm: "65%" }}}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        disabled={isLoading}
                        id="username"
                        label="Nutzername (max. 20 Zeichen)"
                        name="username"
                        inputProps={{ maxLength: 20 }}
                        value={localUser.name}
                        onChange={(event) => setLocalUser({...localUser, name: event.target.value})}
                    />
                    <Alert severity="info">
                        {"Wenn du dein Passwort nicht ändern möchtest, dann lasse die beiden Felder einfach leer."}
                    </Alert>
                    <TextField
                        margin="normal"
                        disabled={isLoading}
                        fullWidth
                        name="password"
                        label="Neues Passwort"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={(event) => setLocalUser({...localUser, password: event.target.value})}
                    />
                    <TextField
                        margin="normal"
                        disabled={isLoading}
                        fullWidth
                        name="passwordRepeat"
                        label="Neues Passwort wiederholen"
                        type="password"
                        id="passwordRepeat"
                        autoComplete="current-password"
                        onChange={(event) => setLocalUser({...localUser, passwordRepeat: event.target.value})}
                    />
                    <Typography variant="subtitle1" color="text.secondary" component="div" sx={{fontSize: "0.8em", marginBottom: "1em", marginTop: "0.1em"}}>
                        Passwortsicherheit: min. 8 Zeichen, 1 Großbuchstabe, 1 Kleinbuchstabe, 1 Ziffer, 1 Sonderzeichen (!@#$&*.-_?+=)
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                id="sendReminder"
                                name="sendReminder"
                                checked={localUser.reminder}
                                onChange={(event) => setLocalUser({...localUser, reminder: event.target.checked})}
                            />
                        }
                        label="Sende mir Erinnerungen für fehlende Tipps via Email"
                    />
                    <Button
                        onClick={handleSubmit}
                        type="button"
                        fullWidth
                        disabled={isSubmitting}
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isSubmitting ? <CircularProgress size={25} color={"secondary"} /> : "Speichern"}
                    </Button>
                </Box>
            </Box>
        </Card>
    </>;
};

export default Profile;