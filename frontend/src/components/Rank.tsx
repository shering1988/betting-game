import React from "react";
import RankingResponse from "../types/response/RankingResponse";
import {alpha, Card, CardMedia, Chip, Divider, IconButton, Menu, MenuItem, Typography, useTheme} from "@mui/material";
import Box from "@mui/material/Box";
import NoProfileImage from "../assets/no-profile-image.png";
import StyledLink from "../styledComponents/StyledLink";
import HelpIcon from "@mui/icons-material/Help";
import Avatar from "@mui/material/Avatar";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {useNavigate} from "react-router-dom";
import useAuth from "../hook/useAuth";

type RankProps = {
    rank: RankingResponse,
    place: number
}

const Rank: React.FC<RankProps> = (props: RankProps) => {
    const {rank, place} = props;

    const navigate = useNavigate();
    const auth = useAuth();
    const theme = useTheme();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const navigateToProfile = () => {
        setAnchorEl(null);
        navigate(`/user/${rank.user.id}`);
    };

    return <Card
        variant="outlined"
        sx={{
            display: "flex",
            p: 1,
            flexDirection: "row",
            borderBottom: "2px solid " + (rank.user.id !== auth.getUser()?.id ? "#666666" : theme.palette.primary.main),
            marginBottom: "1em",
            justifyContent: "start",
            position: "relative",
            backgroundColor: (rank.user.id !== auth.getUser()?.id ? "rgba(255, 255, 255, 0.05)" : alpha(theme.palette.primary.main, 0.1))
        }}
    >
        <Chip sx={{position: "absolute", top: "-5px", left: "-5px"}} label={`# ${place + 1}`} color="primary" variant="filled" />
        <CardMedia
            component="img"
            width="90"
            height="90"
            alt={`Profilbild von ${rank.user.name}`}
            src={rank.user.profileImage ? rank.user.profileImage.path : NoProfileImage}
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
                    <StyledLink to={`/user/${rank.user.id}`}>
                        {rank.user.name.length > 12 ? rank.user.name.substring(0, 12) + "\u2026" : rank.user.name}
                    </StyledLink>
                </Typography>
                <Typography variant="body2" color="secondary" sx={{ display: "flex", justifyContent: "start" }}>
                    <span style={{fontWeight:700}}>{rank.score} Punkte</span>&nbsp;{` (${String.fromCharCode(216)} ${rank.average})`}
                </Typography>
            </Box>
        </Box>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <IconButton
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                color={"primary"}
            >
                <HelpIcon sx={{fontSize:"2rem"}} />
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
                <MenuItem onClick={handleClose}>
                    <Avatar variant={"rounded"} sx={{fontSize: "0.9em", mr: 1,width: 20, height: 20, color:"black!important",backgroundColor: "primary.main"}}>{rank.incorrect}</Avatar> Falsch
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <Avatar variant={"rounded"} sx={{fontSize: "0.9em", mr: 1,width: 20, height: 20, color:"black!important",backgroundColor: "primary.main"}}>{rank.correct}</Avatar> Richtig
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <Avatar variant={"rounded"} sx={{fontSize: "0.9em", mr: 1,width: 20, height: 20, color:"black!important",backgroundColor: "primary.main"}}>{rank.tending}</Avatar> Tendenz
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <Avatar variant={"rounded"} sx={{fontSize: "0.9em", mr: 1,width: 20, height: 20, color:"black!important",backgroundColor: "primary.main"}}>{rank.finals_bet}</Avatar> r. Finaltipps
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <Avatar variant={"rounded"} sx={{fontSize: "0.9em", mr: 1,width: 20, height: 20, color:"black!important",backgroundColor: "primary.main"}}>{rank.game_end}</Avatar> Spielende
                </MenuItem>
                <Divider />
                <MenuItem onClick={navigateToProfile}>
                    <OpenInNewIcon sx={{mr: 1}} fontSize={"small"} /> zum Profil
                </MenuItem>
            </Menu>
        </div>
    </Card>;
};

export default Rank;