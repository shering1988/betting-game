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
import {Alert, CircularProgress, Snackbar, Stack} from "@mui/material";
import Container from "@mui/material/Container";
import LockResetIcon from "@mui/icons-material/LockReset";
import StyledLink from "../styledComponents/StyledLink";

const ForgotPassword: React.FC = () => {
    const auth = useAuth();

    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [success, setSuccess] = React.useState<boolean>(false);

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;

        await auth.forgotPassword(email).then(() => {
            setSuccess(true);
            setIsLoading(false);
        }).catch((status) => {
            setErrorCode(status);
            setIsLoading(false);
        });
    };

    const handleCloseError = () => {
        setErrorCode(null);
    };

    const handleCloseSuccess = () => {
        setSuccess(false);
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
                            {errorCode === 400 ? "Fehler bei der Rücksetzung, bitte informiere den Administrator." : ""}
                            {errorCode === 404 ? "Email-Adresse wurde nicht gefunden." : ""}
                            {errorCode === 409 ? "Es ist aktuell noch ein Rücksetzungsverfahren aktiv, bitte prüfe dein Email-Postfach." : ""}
                            {"Es ist ein Fehler aufgetreten, bitte informiere den Administrator."}
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
                            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}><LockResetIcon /></Avatar>
                            <Typography component="h1" variant="h5">
                                Passwort zurücksetzen
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                                {!success && (
                                    <>
                                        <Alert severity="info">
                                            {"Trage hier die Email-Adresse ein mit der du dich im System registriert hast."}
                                        </Alert>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            disabled={isLoading}
                                            id="email"
                                            label="Email"
                                            name="email"
                                            autoComplete="email"
                                            autoFocus
                                        />
                                        <Button
                                            type="submit"
                                            fullWidth
                                            disabled={isLoading}
                                            variant="contained"
                                            sx={{ mt: 3, mb: 2 }}
                                        >
                                            {isLoading ? <CircularProgress size={25} color={"secondary"} /> : "Anfrage stellen"}
                                        </Button>
                                        <Grid container>
                                            <Grid item xs>
                                                <Link sx={{textDecoration: "none"}} href="/login" variant="body2">
                                                    zurück zur Anmeldung
                                                </Link>
                                            </Grid>
                                            <Grid item>
                                                <Link sx={{textDecoration: "none"}} href="/register" variant="body2">
                                                    {"Registrierung"}
                                                </Link>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                                {success && (
                                    <Alert onClose={handleCloseSuccess} severity="success">
                                        {"Falls die Email-Adresse im System existiert, hast du soeben eine Email erhalten mit den weiteren Schritten. Bitte prüfe nun dein Postfach. "}<StyledLink to={"/login"}>Zurück zur Anmeldung</StyledLink>
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

export default ForgotPassword;