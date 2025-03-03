import React, {useContext} from "react";
import Box from "@mui/material/Box";
import {
    alpha,
    Card, Dialog,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography, useTheme
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BetResponse from "../types/response/BetResponse";
import useAuth from "../hook/useAuth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import translateGameEnd from "../helpers/translateGameEnd";
import StyledLink from "../styledComponents/StyledLink";
import useBets from "../hook/useBets";
import Confirm from "./Confirm";
import BetForm from "./forms/BetForm";
import {NotificationContext} from "../context/NotificationContext";
import NoProfileImage from "../assets/no-profile-image.png";
import Avatar from "@mui/material/Avatar";
import HelpOutline from "@mui/icons-material/HelpOutline";
import {Outbound} from "@mui/icons-material";
import {grey, lime} from "@mui/material/colors";

type BetProps = {
    bet: BetResponse;
    showGameInfo?: boolean;
    showUserName?: boolean;
    onChange?: () => void;
}

const Bet: React.FC<BetProps> = (props) => {
    const {onChange, bet, showGameInfo = false, showUserName = true} = props;

    const auth = useAuth();
    const betApi = useBets();
    const theme = useTheme();
    const { setNotification } = useContext(NotificationContext);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [showConfirm, setShowConfirm] = React.useState<boolean>(false);
    const [openModal, setOpenModal] = React.useState(false);
    const open = Boolean(anchorEl);

    const deleteBet = (id: number) => {
        betApi.deleteData(id).then(() => {
            setNotification({type: "success", message: "Tipp erfolgreich gelöscht."});
            setShowConfirm(false);
            if(onChange) {
                onChange();
            }
        }).catch(() => {
            setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            setShowConfirm(false);
        });
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

    const date = new Date(bet.game.start);
    const dateString = date.toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit", year: "numeric"});
    const timeString = date.toLocaleTimeString("de-DE", {timeZone: "Europe/Berlin", hour12: false, hour: "2-digit", minute: "2-digit"});

    return (
        <div style={{position: "relative"}}>
            {((bet.user.id === auth.getUser()?.id && Date.parse(bet.game.start ?? "") > Date.now()) || auth.getUser()?.isAdmin) && (
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute", top: "0", right: "0"
                }}>
                    <IconButton
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleClick}
                        color={"primary"}
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
                        <MenuItem onClick={handleModalOpen}>
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
            <Dialog
                fullWidth
                maxWidth={"sm"}
                open={openModal}
                onClose={() => handleModalClose()}
                hideBackdrop={true}
                sx={{backgroundColor: "rgba(0,0,0,0.9)", overflow: "hidden"}}
            >
                <div>
                    <BetForm bet={bet} game={bet.game} closeModal={handleModalClose} />
                </div>
            </Dialog>
            {showConfirm && (
                <Confirm onClose={(confirm: boolean) => {
                    if(confirm) {
                        deleteBet(bet.id);
                    } else {
                        setShowConfirm(false);
                    }
                }} />
            )}
            <Card
                variant="outlined"
                sx={{
                    display: "flex",
                    p: 1,
                    flexDirection: {
                        xs: "column",
                        sm: "row",
                    },
                    borderBottom: "2px solid " + (bet.user.id !== auth.getUser()?.id ? "#666666" : theme.palette.primary.main),
                    marginBottom: "1em",
                    justifyContent: {
                        xs: "center",
                        sm: "space-between"
                    },
                    backgroundColor: (bet.user.id !== auth.getUser()?.id ? "rgba(255, 255, 255, 0.05)" : alpha(theme.palette.primary.main, 0.1))
                }}
            >
                <Box sx={{ width: { xs: "100%", sm: "7em" }, marginRight: "1em", alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                    {bet.score.goal_result === "correct" && (
                        <CheckCircleIcon titleAccess={"Richtig"} sx={{fontSize:"3rem"}} color={"primary"} />
                    )}
                    {bet.score.goal_result === "tending" && (
                        <Outbound titleAccess={"Tendenz"} sx={{fontSize:"3rem", color: lime[400]}} />
                    )}
                    {bet.score.goal_result === "incorrect" && (
                        <RemoveCircleIcon titleAccess={"Falsch"} color={"error"} sx={{fontSize:"3rem"}} />
                    )}
                    {!bet.score.goal_result && (
                        <HelpOutline titleAccess={"Noch offen"} sx={{color: grey[400], fontSize:"3rem"}} />
                    )}
                    {
                        bet.score.goal_result && (
                            `+ ${bet.score.score} Pkt.`
                        )
                    }
                </Box>
                <Typography sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: {
                        xs: "center",
                        sm: "start"
                    },
                    justifyContent: "center"
                }}>
                    {showUserName && (
                        <Typography noWrap variant="h6" component="div" fontWeight="bold">
                            <div style={{display: "flex"}}><Avatar sx={{mr: "0.5em", width: "25px", height: "25px"}} src={bet.user.profileImage ? bet.user.profileImage.path : NoProfileImage} /> <StyledLink to={`/user/${bet.user.id}`}>{bet.user.name}</StyledLink></div>
                        </Typography>
                    )}
                    <Typography noWrap variant="body2" color="secondary">
                        {`Tippte auf ${bet.teamHomeScore} : ${bet.teamGuestScore} ${bet.gameEnd ? `(${translateGameEnd(bet.gameEnd)})` : ""}`}
                    </Typography>
                    {showGameInfo && (
                        <>
                            <Typography noWrap variant="body2" color="default">
                                <StyledLink to={`/game/${bet.game.id}`}>{`${bet.game.teamHome.name} ${bet.game.scoreTeamHome ?? ""} : ${bet.game.scoreTeamGuest ?? ""} ${bet.game.teamGuest.name} ${bet.game.gameEnd ? `(${translateGameEnd(bet.game.gameEnd)})` : ""}`}</StyledLink>
                            </Typography>
                            <Typography noWrap variant="body2" color="text.secondary" component="div">
                                {dateString} um {timeString} Uhr
                            </Typography>
                        </>
                    )}
                </Typography>
            </Card>
        </div>
    );
};

export default Bet;