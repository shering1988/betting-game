import React, {useContext} from "react";
import useGames from "../hook/useGames";
import {Alert, Button, Dialog, Tab, Tabs} from "@mui/material";
import GameResponse from "../types/response/GameResponse";
import Box from "@mui/material/Box";
import Loader from "../components/Loader";
import Game from "../components/Game";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import useAuth from "../hook/useAuth";
import useCsv from "../hook/useCsv";
import {TournamentContext} from "../context/TournamentContext";
import GameForm from "../components/forms/GameForm";
import {NotificationContext} from "../context/NotificationContext";
import {ContentPaste} from "@mui/icons-material";

type TabPanelProps = {
    children?: React.ReactNode,
    index: number,
    value: number,
};

const Games = () => {
    const auth = useAuth();
    const gamesApi = useGames();
    const fileApi = useCsv();
    const [games, setGames] = React.useState<GameResponse[]>([]);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [hasChanged, setHasChanged] = React.useState<number>(0);
    const [tab, setTab] = React.useState(0);
    const { tournament: storedTournament } = useContext(TournamentContext);
    const [openModal, setOpenModal] = React.useState(false);
    const { setNotification } = useContext(NotificationContext);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const handleModalOpen = () => {
        setOpenModal(true);
    };

    const handleModalClose = (error?: boolean) => {
        if(typeof error !== "undefined") {
            if(error) {
                setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            } else {
                setNotification({type: "success", message: "Spiel erfolgreich gespeichert."});
                setHasChanged(hasChanged + 1);
            }
        }
        setOpenModal(false);
    };

    const handleIcsDownload = () => {
        if(storedTournament.id) {
            fileApi.getData(storedTournament.id).then((file:Blob) => {
                const fileUrl = window.URL.createObjectURL(file);
                window.location.assign(fileUrl);
                setIsLoading(false);
            }).catch(() => {
                setNotification({type: "error", message: "Fehler beim Download, bitte informiere den Administrator."});
                setIsLoading(false);
            });
        }
    };

    const handleIcsUrlCopy = () => {
        if(storedTournament.id) {
            navigator.clipboard.writeText(`${process.env.REACT_APP_BASEURL}/ics/tournament/${storedTournament.id}`).then(function() {
                setNotification({type: "success", message: "Kalender-URL erfolgreich in die Zwischenablage kopiert."});
            }, function(err) {
                setNotification({type: "error", message: `Fehler beim Kopieren der URL in die Zwischenablage. Fehler: ${err}`});
            });
        }
    };

    React.useEffect(() => {
        if(storedTournament.id) {
            gamesApi.getData(storedTournament.id).then((games:GameResponse[]) => {
                setGames(games);
                setIsLoading(false);
            }).catch((status: number) => {
                setErrorCode(status);
                setIsLoading(false);
            });
        }
    }, [hasChanged]);

    if(errorCode && !isLoading) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    const CustomTabPanel = (props: TabPanelProps) => {
        const { children, value, index } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
            >
                {value === index && (
                    <Box sx={{paddingTop: "1em", gap: "1em", flexWrap: "wrap", display: "flex", flexDirection: {xs: "column", sm: "row"}}}>
                        {children}
                    </Box>
                )}
            </div>
        );
    };

    if(isLoading) {
        return <Loader />;
    }

    return <div>
        {auth.getUser()?.isAdmin && (
            <>
                <Dialog
                    fullWidth
                    maxWidth={"sm"}
                    open={openModal}
                    hideBackdrop={true}
                    onClose={() => handleModalClose()}
                    sx={{overflow: "hidden", backgroundColor: "rgba(0,0,0,0.9)"}}
                >
                    <div>
                        <GameForm closeModal={handleModalClose} />
                    </div>
                </Dialog>
                <Button onClick={handleModalOpen} sx={{marginBottom: "1em"}} variant={"contained"} color={"primary"} fullWidth startIcon={<AddCircleIcon />}>
                    Spiel hinzufügen
                </Button>
            </>
        )}
        <Box sx={{
            display: "flex",
            gap: {
                xs: 0,
                sm: "1em",
            },
            flexDirection: {
                xs: "column",
                sm: "row",
            },
        }}>
            <Button onClick={handleIcsDownload} sx={{marginBottom: "1em"}} variant={"outlined"} color={"primary"} fullWidth startIcon={<CalendarMonthIcon />}>
                Kalender-Datei herunterladen
            </Button>
            <Button onClick={handleIcsUrlCopy} sx={{marginBottom: "1em"}} variant={"outlined"} color={"primary"} fullWidth startIcon={<ContentPaste />}>
                Kalender-URL kopieren
            </Button>
        </Box>
        <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab label="Anstehende Spiele" />
            <Tab label="Beendete Spiele" />
        </Tabs>
        <CustomTabPanel value={tab} index={0}>
            {games.filter((game: GameResponse) => !game.scoreTeamGuest).length === 0 && (
                <Alert sx={{width: "100%"}} severity="info">Keine Spiele vorhanden</Alert>
            )}
            {games.filter((game: GameResponse) => !game.gameEnd).sort((a: GameResponse, b: GameResponse) => a.start.localeCompare(b.start)).map((game:GameResponse, index: number) => {
                return <Game onChange={() => setHasChanged(hasChanged + 1)} key={`game-card-${index}`} game={game} />;
            })}
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={1}>
            {games.filter((game: GameResponse) => game.scoreTeamGuest).length === 0 && (
                <Alert sx={{width: "100%"}} severity="info">Keine Spiele vorhanden</Alert>
            )}
            {games.filter((game: GameResponse) => game.gameEnd).sort((a: GameResponse, b: GameResponse) => b.start.localeCompare(a.start)).map((game:GameResponse, index: number) => {
                return <Game key={`game-card-${index}`} game={game} />;
            })}
        </CustomTabPanel>
    </div>;
};

export default Games;