import React, {useContext} from "react";
import Box from "@mui/material/Box";
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
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TournamentResponse from "../types/response/TournamentResponse";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import useAuth from "../hook/useAuth";
import SwapHorizontalCircleIcon from "@mui/icons-material/SwapHorizontalCircle";
import {useNavigate} from "react-router-dom";
import {TournamentContext} from "../context/TournamentContext";
import useTournaments from "../hook/useTournaments";
import Confirm from "./Confirm";
import TournamentForm from "./forms/TournamentForm";
import {NotificationContext} from "../context/NotificationContext";

type TournamentProps = {
    tournament: TournamentResponse;
    onChange?: () => void;
}

const Tournament: React.FC<TournamentProps> = (props) => {
    const {onChange, tournament} = props;
    const { tournament: chosenTournament, setTournament } = useContext(TournamentContext);
    const { setNotification } = useContext(NotificationContext);

    const auth = useAuth();
    const navigate = useNavigate();
    const tournamentApi = useTournaments();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [showConfirm, setShowConfirm] = React.useState<boolean>(false);
    const [openModal, setOpenModal] = React.useState(false);

    const deleteTournament = (id: number) => {
        tournamentApi.deleteData(id).then(() => {
            setNotification({type: "success", message: "Turnier erfolgreich gelöscht."});
            setShowConfirm(false);
            if(onChange) {
                onChange();
            }
            navigate("/tournaments");
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
                setNotification({type: "success", message: "Turnier erfolgreich gespeichert."});
                if(onChange) {
                    onChange();
                }
            }
        }
        setOpenModal(false);
    };

    const switchTournament = () => {
        setTournament(tournament);
        handleClose();
        navigate("/tournaments");
    };

    if(!chosenTournament) {
        return <></>;
    }

    return (
        <Card
            variant="outlined"
            sx={{
                display: "flex",
                p: 1,
                flexDirection: "row",
                borderBottom: "2px solid #666666",
                marginBottom: "1em",
                justifyContent: "space-between",
                backgroundColor: "rgba(255, 255, 255, 0.05)"
            }}
        >
            {showConfirm && (
                <Confirm onClose={(confirm: boolean) => {
                    if(confirm) {
                        deleteTournament(tournament.id);
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
                    <TournamentForm tournament={tournament} closeModal={handleModalClose} />
                </div>
            </Dialog>
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                flexDirection: "row"
            }}>
                <Box sx={{ width: "100%", alignSelf: "center", justifyContent: "left", display: "flex", flexDirection: "row" }}>
                    <Typography color={chosenTournament.id === tournament.id ? "secondary" : "default"} variant="h6" component="div" fontWeight="bold" sx={{ display: "flex", justifyContent: "left" }}>
                        {tournament.name}
                    </Typography>
                    {tournament.isActive && (
                        <TaskAltIcon titleAccess={"Das aktuell laufende Turnier"} sx={{marginTop: "6px", marginLeft: "0.5em"}} color={"primary"} fontSize="small" />
                    )}
                </Box>
                <Box sx={{
                    marginLeft: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
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
                        {chosenTournament.id !== tournament.id && (
                            <MenuItem onClick={switchTournament}>
                                <ListItemIcon>
                                    <SwapHorizontalCircleIcon color={"primary"} fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>zum Turnier wechseln</ListItemText>
                            </MenuItem>
                        )}
                        {auth.getUser()?.isAdmin && (
                            [
                                <MenuItem key={"menu-edit"} onClick={handleModalOpen}>
                                    <ListItemIcon>
                                        <EditIcon color={"primary"} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Bearbeiten</ListItemText>
                                </MenuItem>,
                                <MenuItem disabled={chosenTournament.id === tournament.id} key={"delete-edit"} onClick={
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
                            ]
                        )}
                    </Menu>
                </Box>
            </Box>
        </Card>
    );
};

export default Tournament;