import * as React from "react";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import useAuth from "../hook/useAuth";
import {Alert, CircularProgress, FormControlLabel, Snackbar, Stack, Switch} from "@mui/material";
import Container from "@mui/material/Container";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import StyledLink from "../styledComponents/StyledLink";
import Ajv, {ErrorObject} from "ajv";
import ajvErrors from "ajv-errors";
import {useContext} from "react";
import {NotificationContext} from "../context/NotificationContext";
import RegisterSchema from "../schemas/Register";

const Register: React.FC = () => {
    const auth = useAuth();

    const ajv = new Ajv({allErrors: true});
    ajvErrors(ajv);
    const validate = ajv.compile(RegisterSchema);

    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [success, setSuccess] = React.useState<boolean>(false);
    const { setNotification } = useContext(NotificationContext);

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const username = formData.get("display") as string;
        const password = formData.get("password") as string;
        const passwordRepeat = formData.get("passwordRepeat") as string;
        const email = formData.get("email") as string;
        const secret = formData.get("secret") as string;
        const reminder = formData.get("reminder") as string;

        if (validate({
            name: username,
            password: password,
            passwordRepeat: passwordRepeat,
            email: email.toLowerCase(),
            secret: secret,
            reminder: reminder === "on"
        })) {
            await auth.register(username, password, passwordRepeat, email, secret, reminder).then(() => {
                setIsLoading(false);
                setSuccess(true);
            }).catch((status: number) => {
                setErrorCode(status);
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
                            {errorCode === 400 || errorCode === 500 ? "Fehler bei der Registrierung, bitte informiere den Administrator." : ""}
                            {errorCode === 401 ? "Die eingegebenen Passwörter waren nicht identisch." : ""}
                            {errorCode === 403 ? "Der eingegebene Schlüssel ist falsch." : ""}
                            {errorCode === 409 ? "Diese Email-Adresse existiert bereits." : ""}
                        </Alert>
                    </Snackbar>
                )}
                <Grid container component="main" sx={{ border: "2px solid teal", boxShadow: "1px 1px 150px 0 #07B0AB" }}>
                    <Grid item xs={12} sm={8} md={5} component={Paper} elevation={4} square>
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}><AppRegistrationIcon /></Avatar>
                            <Typography component="h1" variant="h5">
                                Registrierung
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                                {!success && (
                                    <>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            disabled={isLoading}
                                            id="email"
                                            label="Email"
                                            name="email"
                                        />
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            disabled={isLoading}
                                            id="display"
                                            label="Nutzername (max. 20 Zeichen)"
                                            inputProps={{ maxLength: 20 }}
                                            name="display"
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
                                        />
                                        <TextField
                                            margin="normal"
                                            required
                                            disabled={isLoading}
                                            fullWidth
                                            name="passwordRepeat"
                                            label="Passwort wiederholen"
                                            type="password"
                                            id="passwordRepeat"
                                        />
                                        <Typography variant="subtitle1" color="text.secondary" component="div" sx={{fontSize: "0.8em", marginBottom: "1em", marginTop: "0.1em"}}>
                                            Passwortsicherheit: min. 8 Zeichen, 1 Großbuchstabe, 1 Kleinbuchstabe, 1 Ziffer, 1 Sonderzeichen (!@#$&*.-_?+=)
                                        </Typography>
                                        <TextField
                                            margin="normal"
                                            required
                                            disabled={isLoading}
                                            fullWidth
                                            name="secret"
                                            label="Schlüssel"
                                            type="secret"
                                            id="secret"
                                        />
                                        <FormControlLabel control={
                                            <Switch
                                                id="reminder"
                                                name="reminder"
                                                defaultValue={"true"}
                                            />
                                        } label="Sende mir Erinnerungen für fehlende Tipps via Email"
                                        />
                                        <Button
                                            type="submit"
                                            fullWidth
                                            disabled={isLoading}
                                            variant="contained"
                                            sx={{ mt: 3, mb: 2 }}
                                        >
                                            {isLoading ? <CircularProgress size={25} color={"secondary"} /> : "Registrieren"}
                                        </Button>
                                        <Grid container>
                                            <Grid item xs>
                                                <Link sx={{textDecoration: "none"}} href="/login" variant="body2">
                                                    zurück zur Anmeldung
                                                </Link>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                                {success && (
                                    <Alert severity="success">
                                        {"Registrierung erfolgreich - bitte prüfe nun dein Postfach um deine Registrierung zu bestätigen."}<StyledLink to={"/login"}>Zurück zur Anmeldung</StyledLink>
                                    </Alert>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Stack>
    );
};

export default Register;