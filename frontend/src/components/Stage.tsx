import React, {useContext} from "react";
import StageResponse from "../types/response/StageResponse";
import Box from "@mui/material/Box";
import {
    Card, Dialog,
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
import StyledLink from "../styledComponents/StyledLink";
import {useNavigate} from "react-router-dom";
import useStages from "../hook/useStages";
import Confirm from "./Confirm";
import StageForm from "./forms/StageForm";
import {NotificationContext} from "../context/NotificationContext";
import useAuth from "../hook/useAuth";

type StageProps = {
    stage: StageResponse;
    onChange?: () => void;
}

const Stage: React.FC<StageProps> = (props) => {
    const {onChange, stage} = props;

    const navigate = useNavigate();
    const stageApi = useStages();
    const auth = useAuth();
    const { setNotification } = useContext(NotificationContext);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [showConfirm, setShowConfirm] = React.useState<boolean>(false);
    const [openModal, setOpenModal] = React.useState(false);

    const deleteStage = (id: number) => {
        stageApi.deleteData(id).then(() => {
            setNotification({type: "success", message: "Gruppe erfolgreich gelöscht."});
            setShowConfirm(false);
            if(onChange) {
                onChange();
            }
            navigate("/stages");
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
                setNotification({type: "success", message: "Gruppe erfolgreich gespeichert."});
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
                        deleteStage(stage.id);
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
                    <StageForm stage={stage} closeModal={handleModalClose} />
                </div>
            </Dialog>
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                flexDirection: "row"

            }}>
                <Box sx={{ width: "100%", alignSelf: "center", justifyContent: "left", display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" component="div" fontWeight="bold" sx={{ display: "flex", justifyContent: "left" }}>
                        <StyledLink to={`/stage/${stage.id}`}>{stage.name}</StyledLink>
                    </Typography>
                    {stage.isFinal && (
                        <Typography gutterBottom color={"primary"} variant="caption">
                            KO-Runde
                        </Typography>
                    )}
                    {stage.isGrandFinal && (
                        <Typography gutterBottom color={"primary"} variant="caption">
                            Finale
                        </Typography>
                    )}
                </Box>
                {auth.getUser()?.isAdmin && (
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

export default Stage;