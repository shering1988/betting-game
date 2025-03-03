import * as React from "react";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import useAuth from "../hook/useAuth";
import {useNavigate} from "react-router-dom";
import {Alert, CircularProgress, Snackbar, Stack} from "@mui/material";
import Container from "@mui/material/Container";
import useTournaments from "../hook/useTournaments";
import TournamentResponse from "../types/response/TournamentResponse";
import {useContext} from "react";
import {NotificationContext} from "../context/NotificationContext";
import Ajv, {ErrorObject} from "ajv";
import ajvErrors from "ajv-errors";
import LoginSchema from "../schemas/Login";
import {TournamentContext} from "../context/TournamentContext";

const Login: React.FC = () => {
    const auth = useAuth();
    const tournamentsApi = useTournaments();
    const navigate = useNavigate();

    const ajv = new Ajv({allErrors: true});
    ajvErrors(ajv);
    const validate = ajv.compile(LoginSchema);

    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { setNotification } = useContext(NotificationContext);
    const { setTournament } = useContext(TournamentContext);

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const username = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (validate({username: username, password: password})) {
            await auth.login(username.toLowerCase(), password).then(() => {
                tournamentsApi.getActive().then((tournament:TournamentResponse) => {
                    localStorage.setItem("activeTournament", JSON.stringify(tournament));
                    setTournament(tournament);
                    setIsLoading(false);
                    navigate("/ranking");
                }).catch(() => {
                    localStorage.removeItem("activeTournament");
                    setErrorCode(404);
                    setIsLoading(false);
                });
            }).catch(() => {
                setErrorCode(401);
                setIsLoading(false);
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
            setIsLoading(false);
        }
    };

    const handleCloseError = () => {
        setErrorCode(null);
    };

    return (
        <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ width: 1, marginTop: "3em" }}
        >
            <Container maxWidth="md" sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                {errorCode && (
                    <Snackbar anchorOrigin={{vertical: "top", horizontal: "center"}} open={true} autoHideDuration={5000} onClose={handleCloseError}>
                        <Alert onClose={handleCloseError} severity="error">
                            {errorCode === 401 ? "Anmeldung fehlgeschlagen!" : "Anmeldung nicht möglich - es gibt kein aktives Turnier."}
                        </Alert>
                    </Snackbar>
                )}
                <Grid container component="main" sx={{ border: "2px solid teal" }}>
                    <Grid item xs={12} sm={12} md={12} component={Paper} elevation={4} square>
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}><LockOutlinedIcon /></Avatar>
                            <Typography component="h1" variant="h5">
                                Anmeldung
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    disabled={isLoading}
                                    id="email"
                                    label="Email"
                                    name="email"
                                    autoComplete="email"
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    disabled={isLoading}
                                    fullWidth
                                    name="password"
                                    label="Passwort"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isLoading}
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    {isLoading ? <CircularProgress size={25} color={"secondary"} /> : "Anmelden"}
                                </Button>
                                <Grid container>
                                    <Grid item xs>
                                        <Link sx={{textDecoration: "none"}} href="/forgot-password" variant="body2">
                                            Passwort vergessen?
                                        </Link>
                                    </Grid>
                                    <Grid item>
                                        <Link sx={{textDecoration: "none"}} href="/register" variant="body2">
                                            {"Registrierung"}
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Stack>
    );
};

export default Login;