import React, {useContext} from "react";
import {
    Card,
    Dialog,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography
} from "@mui/material";
import Box from "@mui/material/Box";
import GameResponse from "../types/response/GameResponse";
import SettingsIcon from "@mui/icons-material/Settings";
import BetResponse from "../types/response/BetResponse";
import RuleIcon from "@mui/icons-material/Rule";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {Link, useNavigate} from "react-router-dom";
import useAuth from "../hook/useAuth";
import BetForm from "./forms/BetForm";
import translateGameEnd from "../helpers/translateGameEnd";
import StyledLink from "../styledComponents/StyledLink";
import useGames from "../hook/useGames";
import Confirm from "./Confirm";
import GameForm from "./forms/GameForm";
import {NotificationContext} from "../context/NotificationContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import {Outbound} from "@mui/icons-material";
import {lime} from "@mui/material/colors";

type GameProps = {
    game: GameResponse,
    onChange?: () => void;
    isDetailView?: boolean;
}

const Game: React.FC<GameProps> = (props: GameProps) => {
    const {isDetailView = false, onChange, game} = props;

    const navigate = useNavigate();
    const auth = useAuth();
    const gameApi = useGames();
    const { setNotification } = useContext(NotificationContext);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [openModal, setOpenModal] = React.useState(false);
    const [openEditModal, setOpenEditModal] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState<boolean>(false);

    let personalBet: BetResponse | undefined = undefined;
    if(game.bets) {
        personalBet = game.bets.filter((bet: BetResponse) => {
            if(bet.user.id === auth.getUser()?.id) {
                return bet;
            }
        })[0];
    }

    const deleteGame = (id: number) => {
        gameApi.deleteData(id).then(() => {
            setNotification({type: "success", message: "Spiel erfolgreich gelöscht."});
            setShowConfirm(false);
            if(onChange) {
                onChange();
            }
            navigate("/games");
        }).catch(() => {
            setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            setShowConfirm(false);
        });
    };

    const handleEditModalOpen = () => {
        setAnchorEl(null);
        setOpenEditModal(true);
    };

    const handleEditModalClose = (error?: boolean) => {
        if(typeof error !== "undefined") {
            if(error) {
                setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            } else {
                setNotification({type: "success", message: "Spiel erfolgreich gespeichert."});
                if(onChange) {
                    onChange();
                }
            }
        }
        setAnchorEl(null);
        setOpenEditModal(false);
    };

    const handleModalOpen = () => {
        setAnchorEl(null);
        setOpenModal(true);
    };

    const handleModalClose = (error?: boolean) => {
        if(typeof error !== "undefined") {
            if(error) {
                setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            } else {
                setNotification({type: "success", message: "Tipp erfolgreich gespeichert."});
                if(onChange) {
                    onChange();
                }
            }
        }
        setAnchorEl(null);
        setOpenModal(false);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const navigateToDetails = () => {
        setAnchorEl(null);
        navigate(`/game/${game.id}`);
    };

    const date = new Date(game.start);
    const dateString = date.toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit", year: "numeric"});
    const timeString = date.toLocaleTimeString("de-DE", {timeZone: "Europe/Berlin", hour12: false, hour: "2-digit", minute: "2-digit"});

    return <Card sx={{
        display: "flex",
        justifyContent: "start",
        borderBottom: "2px solid #666666",
        marginBottom: "1em",
        flexDirection: "column",
        flex: "0 1 calc(50% - 10px)",
        animation: "pulse 0.5s ease-in infinite",
        backgroundColor: "rgba(255, 255, 255, 0.05)"
    }}>
        <Dialog
            fullWidth
            maxWidth={"sm"}
            open={openModal}
            onClose={() => handleModalClose()}
            hideBackdrop={true}
            sx={{backgroundColor: "rgba(0,0,0,0.9)", overflow: "hidden"}}
        >
            <div>
                <BetForm bet={personalBet} game={game} closeModal={handleModalClose} />
            </div>
        </Dialog>
        <Dialog
            fullWidth
            maxWidth={"sm"}
            open={openEditModal}
            hideBackdrop={true}
            onClose={() => handleEditModalClose()}
            sx={{backgroundColor: "rgba(0,0,0,0.9)", overflow: "hidden"}}
        >
            <div>
                <GameForm game={game} closeModal={handleEditModalClose} />
            </div>
        </Dialog>
        {showConfirm && (
            <Confirm onClose={(confirm: boolean) => {
                if(confirm) {
                    deleteGame(game.id);
                } else {
                    setShowConfirm(false);
                }
            }} />
        )}
        <Box sx={{mt: "1em", display: "flex", justifyContent: "center", position: "relative"}}>
            {auth.getUser()?.isAdmin && (
                <Box sx={{position: "absolute", top: "0", right: "0"}}>
                    <IconButton
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleClick}
                        color={"primary"}
                        sx={{mr: {xs: 0, sm: 1}}}
                    >
                        <SettingsIcon color={"disabled"} sx={{fontSize:"2rem"}} />
                    </IconButton>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            "aria-labelledby": "basic-button",
                        }}
                    >
                        <MenuItem onClick={handleEditModalOpen}>
                            <ListItemIcon>
                                <EditIcon color={"primary"} fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Bearbeiten</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={
                            () => {
                                handleClose();
                                setShowConfirm(true);
                            }
                        }>
                            <ListItemIcon>
                                <DeleteIcon color={"primary"} fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Löschen</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            )}
            <AvatarGroup max={2}>
                <Avatar sx={{height: "60px", width: "60px", filter: "grayscale(0.5)"}} src={`/assets/flags/${game.teamHome.shortName.toLowerCase()}.png`} />
                <Avatar sx={{height: "60px", width: "60px", filter: "grayscale(0.5)"}} src={`/assets/flags/${game.teamGuest.shortName.toLowerCase()}.png`} />
            </AvatarGroup>
        </Box>
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: "1em"
        }}>
            <Typography component="div" variant="h6" sx={{width: "100%"}} noWrap>
                <Box sx={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                    <StyledLink to={`/team/${game.teamHome.id}`}>{game.teamHome.name.length > 10 ? game.teamHome.name.substring(0, 10) + "\u2026" : game.teamHome.name}</StyledLink>
                    <div style={{marginLeft: "0.5em", marginRight: "0.5em", fontWeight: 400}}>gegen</div>
                    <StyledLink to={`/team/${game.teamGuest.id}`}>{game.teamGuest.name.length > 10 ? game.teamGuest.name.substring(0, 10) + "\u2026" : game.teamGuest.name}</StyledLink>
                </Box>
            </Typography>
            <Typography gutterBottom color={"text.secondary"} variant="caption">
                <Link style={{textDecoration: "none", color: "rgba(255, 255, 255, 0.7)"}} to={`/stage/${game.stage.id}`}>{game.stage.name}</Link>
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
                {`${dateString} um ${timeString} Uhr`}
            </Typography>
            {game.gameEnd && (
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    width: "90%",
                    borderRadius: "10px",
                    mt: "1em",
                    mb: "1em",
                }}>
                    <Typography sx={{fontWeight: 700}} color={"primary"} component="div" variant="h4">
                        {game.scoreTeamHome} : {game.scoreTeamGuest}
                    </Typography>
                    <Typography sx={{fontWeight: 700}} gutterBottom color={"text.secondary"} variant="caption">
                        {translateGameEnd(game.gameEnd ?? "")}
                    </Typography>
                </Box>
            )}
            {personalBet && (
                <div style={{display: "flex"}}>
                    {personalBet.score.goal_result === "correct" && (
                        <CheckCircleIcon titleAccess={"Richtig"} sx={{fontSize:"1rem", marginTop: "5px", marginRight: "4px"}} color={"primary"} />
                    )}
                    {personalBet.score.goal_result === "tending" && (
                        <Outbound titleAccess={"Tendenz"} sx={{color: lime[400], fontSize:"1rem", marginTop: "5px", marginRight: "4px"}} />
                    )}
                    {personalBet.score.goal_result === "incorrect" && (
                        <RemoveCircleIcon titleAccess={"Falsch"} color={"error"} sx={{fontSize:"1rem", marginTop: "5px", marginRight: "4px"}} />
                    )}
                    <Typography sx={{fontWeight:700}} key={`game-bet-${personalBet.id}`} variant="subtitle1" color="secondary" component="div">
                        {`Dein Tipp: ${personalBet.teamHomeScore} : ${personalBet.teamGuestScore}`} {personalBet.gameEnd ? `(${translateGameEnd(personalBet.gameEnd)})` : ""}
                    </Typography>
                </div>
            )}
            {!personalBet && new Date() < new Date(game.start) && (
                <Typography sx={{opacity: "0.7"}} variant="subtitle1" color="error" component="div">
                    {game.scoreTeamGuest ? "Kein Tipp abgegeben" : "Noch keinen Tipp abgegeben"}
                </Typography>
            )}
        </Box>
        <Box sx={{
            marginLeft: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
        }}>
            {new Date() < new Date(game.start) && (
                <Button
                    onClick={handleModalOpen}
                    color={"primary"}
                    variant={"contained"}
                    startIcon={<RuleIcon />}
                    sx={{width: "90%", mb: isDetailView ? "1em" : "0"}}
                >
                    Tipp abgeben
                </Button>
            )}
            {!isDetailView && (
                <Button
                    onClick={navigateToDetails}
                    color={"primary"}
                    variant={"outlined"}
                    fullWidth
                    startIcon={<SearchIcon />}
                    sx={{width: "90%", mt: new Date() < new Date(game.start) ? "1em" : "0", mb: "1em"}}
                >
                    Spieldetails
                </Button>
            )}
        </Box>
    </Card>;
};

export default Game;