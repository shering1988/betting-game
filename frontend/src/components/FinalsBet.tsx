import React, {useContext} from "react";
import Box from "@mui/material/Box";
import {
    alpha,
    Badge,
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
import FinalsBetResponse from "../types/response/FinalsBetResponse";
import Avatar from "@mui/material/Avatar";
import NoProfileImage from "../assets/no-profile-image.png";
import useAuth from "../hook/useAuth";
import FinalsBetForm from "./forms/FinalsBetForm";
import useFinalsBets from "../hook/useFinalsBets";
import Confirm from "./Confirm";
import {NotificationContext} from "../context/NotificationContext";
import AvatarGroup from "@mui/material/AvatarGroup";
import StyledLink from "../styledComponents/StyledLink";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

type FinalsBetProps = {
    finalsBet: FinalsBetResponse;
    hasTournamentStarted: boolean;
    showUser?: boolean;
    onChange?: () => void;
}

const FinalsBet: React.FC<FinalsBetProps> = (props) => {
    const {onChange, finalsBet, hasTournamentStarted, showUser = true} = props;

    const auth = useAuth();
    const finalsBetApi = useFinalsBets();
    const theme = useTheme();
    const { setNotification } = useContext(NotificationContext);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [showConfirm, setShowConfirm] = React.useState<boolean>(false);
    const [openModal, setOpenModal] = React.useState(false);

    const deleteFinalsBet = (id: number) => {
        finalsBetApi.deleteData(id).then(() => {
            setNotification({type: "success", message: "Finaltipp erfolgreich gelöscht."});
            setShowConfirm(false);
            if(onChange) {
                onChange();
            }
        }).catch(() => {
            setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            setShowConfirm(false);
        });
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleModalOpen = () => {
        setOpenModal(true);
        handleClose();
    };

    const handleModalClose = (error?: boolean) => {
        if(typeof error !== "undefined") {
            if(error) {
                setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
            } else {
                setNotification({type: "success", message: "Finaltipp erfolgreich gespeichert."});
                if(onChange) {
                    onChange();
                }
            }
        }
        setOpenModal(false);
    };

    return (
        <Card
            variant="outlined"
            sx={{
                display: "flex",
                justifyContent: "start",
                borderBottom: "2px solid " + (finalsBet.user.id !== auth.getUser()?.id ? "#666666" : theme.palette.primary.main),
                marginBottom: "1em",
                flexDirection: "column",
                flex: "0 1 calc(50% - 10px)",
                animation: "pulse 0.5s ease-in infinite",
                backgroundColor: (finalsBet.user.id !== auth.getUser()?.id ? "rgba(255, 255, 255, 0.05)" : alpha(theme.palette.primary.main, 0.1))
            }}
        >
            {showConfirm && (
                <Confirm onClose={(confirm: boolean) => {
                    if(confirm) {
                        deleteFinalsBet(finalsBet.id);
                    } else {
                        setShowConfirm(false);
                    }
                }} />
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
                    <FinalsBetForm finalsBet={finalsBet} closeModal={handleModalClose} />
                </div>
            </Dialog>
            <Box sx={{mt: "1em", display: "flex", justifyContent: "center", position: "relative"}}>
                {((finalsBet.user.id === auth.getUser()?.id && !hasTournamentStarted) || auth.getUser()?.isAdmin) && (
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
                            <MenuItem onClick={handleModalOpen}>
                                <ListItemIcon>
                                    <EditIcon color={"primary"} fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Bearbeiten</ListItemText>
                            </MenuItem>
                            {auth.getUser()?.isAdmin && (
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
                            )}
                        </Menu>
                    </Box>
                )}
                <AvatarGroup max={2}>
                    {finalsBet.isTeamHomeEliminated ?
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={
                                <RemoveCircleIcon titleAccess={"Falsch"} color={"error"} sx={{fontSize:"1rem", marginTop: "5px", marginRight: "4px"}} />
                            }
                        >
                            <Avatar
                                sx={{height: "60px", width: "60px", opacity: 0.4, filter: "grayscale(1)"}}
                                src={`/assets/flags/${finalsBet.teamHome.shortName.toLowerCase()}.png`}
                            />
                        </Badge>
                        :
                        <Avatar
                            sx={{height: "60px", width: "60px", filter: "grayscale(0.5)"}}
                            src={`/assets/flags/${finalsBet.teamHome.shortName.toLowerCase()}.png`}
                        />
                    }
                    {finalsBet.isTeamGuestEliminated ?
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={
                                <RemoveCircleIcon titleAccess={"Falsch"} color={"error"} sx={{fontSize:"1rem", marginTop: "5px", marginRight: "4px"}} />
                            }
                        >
                            <Avatar
                                sx={{height: "60px", width: "60px", opacity: 0.4, filter: "grayscale(1)"}}
                                src={`/assets/flags/${finalsBet.teamGuest.shortName.toLowerCase()}.png`}
                            />
                        </Badge>
                        :
                        <Avatar
                            sx={{height: "60px", width: "60px", filter: "grayscale(0.5)"}}
                            src={`/assets/flags/${finalsBet.teamGuest.shortName.toLowerCase()}.png`}
                        />
                    }
                </AvatarGroup>
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <Typography component="div" variant="h6" sx={{width: "100%"}} noWrap>
                    <Box sx={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                        <StyledLink  to={`/team/${finalsBet.teamHome.id}`}>{finalsBet.teamHome.name.length > 10 ? finalsBet.teamHome.name.substring(0, 10) + "\u2026" : finalsBet.teamHome.name}</StyledLink>
                        <div style={{marginLeft: "0.5em", marginRight: "0.5em", fontWeight: 400}}>gegen</div>
                        <StyledLink to={`/team/${finalsBet.teamGuest.id}`}>{finalsBet.teamGuest.name.length > 10 ? finalsBet.teamGuest.name.substring(0, 10) + "\u2026" : finalsBet.teamGuest.name}</StyledLink>
                    </Box>
                </Typography>
                {hasTournamentStarted && (
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
                        <Typography noWrap color={"primary"} component="div" variant="h6" sx={{ marginLeft: "1em"}}>
                            {`+ ${finalsBet.score.points} Pkt.`}
                        </Typography>
                    </Box>
                )}
            </Box>
            {showUser && (
                <Box sx={{mb: "1em", display: "flex", flexDirection: "row", justifyContent: "center"}}>
                    <Avatar sx={{mr: "0.5em", width: "25px", height: "25px"}} src={finalsBet.user.profileImage ? finalsBet.user.profileImage.path : NoProfileImage} /> <StyledLink to={`/user/${finalsBet.user.id}`}>{finalsBet.user.name}</StyledLink>
                </Box>
            )}
        </Card>
    );
};

export default FinalsBet;