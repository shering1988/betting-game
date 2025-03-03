import React, {useContext} from "react";
import Box from "@mui/material/Box";
import {
    Card, CardMedia, Dialog,
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
import TeamResponse from "../types/response/TeamResponse";
import StyledLink from "../styledComponents/StyledLink";
import useTeams from "../hook/useTeams";
import Confirm from "./Confirm";
import TeamForm from "./forms/TeamForm";
import {useNavigate} from "react-router-dom";
import {NotificationContext} from "../context/NotificationContext";
import useAuth from "../hook/useAuth";

type TeamProps = {
    team: TeamResponse;
    onChange?: () => void;
}

const Team: React.FC<TeamProps> = (props) => {
    const {onChange, team} = props;

    const teamApi = useTeams();
    const navigate = useNavigate();
    const auth = useAuth();
    const { setNotification } = useContext(NotificationContext);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [showConfirm, setShowConfirm] = React.useState<boolean>(false);
    const [openModal, setOpenModal] = React.useState(false);

    const deleteTeam = (id: number) => {
        teamApi.deleteData(id).then(() => {
            setNotification({type: "success", message: "Turnier erfolgreich gelöscht."});
            setShowConfirm(false);
            if(onChange) {
                onChange();
            }
            navigate("/teams");
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
                setNotification({type: "success", message: "Team erfolgreich gespeichert."});
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
                        deleteTeam(team.id);
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
                    <TeamForm team={team} closeModal={handleModalClose} />
                </div>
            </Dialog>
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                flexDirection: "row",
            }}>
                <CardMedia
                    component="img"
                    width="90"
                    height="90"
                    image={`/assets/flags/${team.shortName.toLowerCase()}.png`}
                    alt={team.name}
                    sx={{
                        borderRadius: 0.5,
                        width: 90,
                        mr: 1.5,
                        mb: 0,
                        filter: "grayscale(0.5)"
                    }}
                />
                <Box style={{display: "flex", justifyContent: "space-between", width: "100%", flexWrap: "wrap"}}>
                    <Box sx={{ width: "100%", alignSelf: "center", justifyContent: "start" }}>
                        <Typography noWrap variant="h6" component="div" fontWeight="bold" sx={{ display: "flex", justifyContent: "start" }}>
                            <StyledLink to={`/team/${team.id}`}>
                                {team.name.length > 10 ? team.name.substring(0, 10) + "\u2026" : team.name}
                            </StyledLink>
                        </Typography>
                        <Typography variant="body2" color="secondary" sx={{ display: "flex", justifyContent: "start" }}>
                            {team.shortName}
                        </Typography>
                    </Box>
                </Box>
                {auth.getUser()?.isAdmin && (
                    <Box sx={{ flexWrap: "nowrap", alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "row" }}>
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
            </Box>
        </Card>
    );
};

export default Team;