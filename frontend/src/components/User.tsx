import React, {useContext} from "react";
import {Card, CardMedia, IconButton, Menu, MenuItem, Typography, ListItemIcon, ListItemText} from "@mui/material";
import Box from "@mui/material/Box";
import NoProfileImage from "../assets/no-profile-image.png";
import StyledLink from "../styledComponents/StyledLink";
import SettingsIcon from "@mui/icons-material/Settings";
import UserResponse from "../types/response/UserResponse";
import BlockIcon from "@mui/icons-material/Block";
import CheckIcon from "@mui/icons-material/Check";
import useAuth from "../hook/useAuth";
import useUsers from "../hook/useUsers";
import {NotificationContext} from "../context/NotificationContext";

type UserProps = {
    user: UserResponse,
    onChange?: () => void;
    score?: number;
}

const User: React.FC<UserProps> = (props: UserProps) => {
    const {onChange, user, score} = props;

    const auth = useAuth();
    const userApi = useUsers();
    const { setNotification } = useContext(NotificationContext);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const toggleUser = (id: number) => {
        userApi.toggleUser(id).then(() => {
            setNotification({type: "success", message: "Nutzerstatus erfolgreich geändert."});
            if(onChange) {
                onChange();
            }
        }).catch(() => {
            setNotification({type: "error", message: "Fehler beim Speichern, bitte informiere den Administrator."});
        });
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return <Card
        variant="outlined"
        sx={{
            display: "flex",
            p: 1,
            flexDirection: "row",
            borderBottom: "2px solid #666666",
            marginBottom: "1em",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
        }}
    >
        <CardMedia
            component="img"
            width="90"
            height="90"
            alt={`Profilbild von ${user.name}`}
            src={user.profileImage ? user.profileImage.path : NoProfileImage}
            sx={{
                borderRadius: 0.5,
                width: 90,
                mr: 1.5,
                mb: 0,
            }}
        />
        <Box style={{display: "flex", justifyContent: "space-between", width: "100%", flexWrap: "wrap"}}>
            <Box sx={{ width: "100%", alignSelf: "center", justifyContent: "start" }}>
                <Typography variant="h6" component="div" fontWeight="bold" sx={{ display: "flex", justifyContent: "start" }}>
                    <StyledLink to={`/user/${user.id}`}>{user.name}</StyledLink>
                </Typography>
                {user.isEnabled && (
                    <Typography variant="body2" color="secondary" sx={{ display: "flex", justifyContent: "start" }}>
                        aktiv
                    </Typography>
                )}
                {!user.isEnabled && (
                    <Typography variant="body2" color="error" sx={{ display: "flex", justifyContent: "start" }}>
                        nicht aktiv
                    </Typography>
                )}
                {!!score && (
                    <Typography variant="body2" sx={{ display: "flex", justifyContent: "start" }}>
                        Punkte: {score}
                    </Typography>
                )}
            </Box>
        </Box>
        {auth.getUser()?.isAdmin && (
            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
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
                    <MenuItem onClick={
                        () => {
                            handleClose();
                            toggleUser(user.id);
                        }
                    }>
                        <ListItemIcon>
                            {user.isEnabled && (
                                <BlockIcon color={"primary"} fontSize="small" />
                            )}
                            {!user.isEnabled && (
                                <CheckIcon color={"primary"} fontSize="small" />
                            )}
                        </ListItemIcon>
                        <ListItemText>{user.isEnabled ? "Deaktivieren" : "Aktivieren"}</ListItemText>
                    </MenuItem>
                </Menu>
            </div>
        )}
    </Card>;
};

export default User;