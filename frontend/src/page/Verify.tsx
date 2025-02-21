import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import useAuth from "../hook/useAuth";
import {Alert, Snackbar, Stack} from "@mui/material";
import Loader from "../components/Loader";
import Container from "@mui/material/Container";
import StyledLink from "../styledComponents/StyledLink";
import {useSearchParams} from "react-router-dom";
import HowToRegIcon from "@mui/icons-material/HowToReg";

const Verify: React.FC = () => {
    const auth = useAuth();
    const [searchParams] = useSearchParams();
    const url = searchParams.get("url");

    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [success, setSuccess] = React.useState<boolean>(false);

    React.useEffect(() => {
        if(url) {
            const returnUrl = decodeURI(url);
            auth.verify(returnUrl).then(() => {
                setSuccess(true);
                setIsLoading(false);
            }).catch(() => {
                setErrorCode(401);
                setIsLoading(false);
            });
        } else {
            setErrorCode(400);
            setIsLoading(false);
        }
    }, []);

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
                            {"Es ist ein Fehler aufgetreten, bitte informiere den Administrator."}
                        </Alert>
                    </Snackbar>
                )}
                <Grid container component="main" sx={{ height: "45vh" }}>
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
                            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}><HowToRegIcon /></Avatar>
                            <Typography component="h1" variant="h5">
                                Konto bestätigen
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                {isLoading && (
                                    <Loader />
                                )}
                                {success && (
                                    <Alert severity="success">
                                        {"Dein Konto wurde bestätigt, du kannst dich nun anmelden: "}<StyledLink to={"/login"}>Zurück zur Anmeldung</StyledLink>
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

export default Verify;