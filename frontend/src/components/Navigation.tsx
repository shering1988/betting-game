import * as React from "react";
import {useNavigate} from "react-router-dom";
import {List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography} from "@mui/material";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SportsIcon from "@mui/icons-material/Sports";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LogoutIcon from "@mui/icons-material/Logout";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import FlagIcon from "@mui/icons-material/Flag";
import CloseIcon from "@mui/icons-material/Close";
import StairsIcon from "@mui/icons-material/Stairs";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import useAuth from "../hook/useAuth";
import StyledLink from "../styledComponents/StyledLink";
import StyledListItem from "../styledComponents/StyledListItem";
import StarsIcon from "@mui/icons-material/Stars";
import HelpOutline from "@mui/icons-material/HelpOutline";
import BarChartIcon from "@mui/icons-material/BarChart";
import {useContext} from "react";
import {TournamentContext} from "../context/TournamentContext";
import appJson from "../app.json";
import {Person} from "@mui/icons-material";

export type INavigation = {
    onClose: () => void;
    isMobile: boolean;
}

const Navigation: React.FC<INavigation> = (props) => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { onClose, isMobile } = props;
    const { tournament: storedTournament } = useContext(TournamentContext);

    const handleLogout = () => {
        auth.logout();
        navigate("/login");
    };

    return <List onClick={onClose}>
        <ListItem disablePadding>
            <ListItemButton sx={{backgroundColor: "primary.main"}}>
                <ListItemIcon>
                    <StarsIcon sx={{color: "white"}} />
                </ListItemIcon>
                <ListItemText sx={{color: "white"}} primary={storedTournament.name} />
            </ListItemButton>
        </ListItem>
        <StyledLink to={"/ranking"}>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <FormatListNumberedIcon color={"primary"} />
                    </ListItemIcon>
                    <ListItemText primary={"Tabelle"} />
                </ListItemButton>
            </ListItem>
        </StyledLink>
        <StyledLink to={"/games"}>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <CalendarMonthIcon color={"primary"} />
                    </ListItemIcon>
                    <ListItemText primary={"Spielplan"} />
                </ListItemButton>
            </ListItem>
        </StyledLink>
        <StyledLink to={"/finalsBets"}>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <MilitaryTechIcon color={"primary"} />
                    </ListItemIcon>
                    <ListItemText primary={"Finaltipps"} />
                </ListItemButton>
            </ListItem>
        </StyledLink>
        <StyledLink to={"/rules"}>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <SportsIcon color={"primary"} />
                    </ListItemIcon>
                    <ListItemText primary={"Regeln"} />
                </ListItemButton>
            </ListItem>
        </StyledLink>
        <StyledLink to={"/statistics"}>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <BarChartIcon color={"primary"} />
                    </ListItemIcon>
                    <ListItemText primary={"Statistiken"} />
                </ListItemButton>
            </ListItem>
        </StyledLink>
        <StyledLink to={"/tournaments"}>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <EmojiEventsIcon color={"primary"} />
                    </ListItemIcon>
                    <ListItemText primary={"Turniere"} />
                </ListItemButton>
            </ListItem>
        </StyledLink>
        {auth.getUser()?.isAdmin && (
            <>
                <Divider component="li" />
                <li>
                    <Typography
                        sx={{ mt: 0.5, ml: 2 }}
                        color="text.secondary"
                        display="block"
                        variant="caption"
                    >
                            Adminbereich
                    </Typography>
                </li>
                <StyledLink to={"/stages"}>
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <StairsIcon color={"primary"} />
                            </ListItemIcon>
                            <ListItemText primary={"Gruppen"} />
                        </ListItemButton>
                    </ListItem>
                </StyledLink>
                <StyledLink to={"/teams"}>
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <FlagIcon color={"primary"} />
                            </ListItemIcon>
                            <ListItemText primary={"Teams"} />
                        </ListItemButton>
                    </ListItem>
                </StyledLink>
                <StyledLink to={"/users"}>
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <GroupsIcon color={"primary"} />
                            </ListItemIcon>
                            <ListItemText primary={"Nutzer"} />
                        </ListItemButton>
                    </ListItem>
                </StyledLink>
            </>
        )}
        <Divider />
        <StyledLink to={`/user/${auth.getUser()?.id}`}>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <Person color={"primary"} />
                    </ListItemIcon>
                    <ListItemText primary={"Dein Profil"} />
                </ListItemButton>
            </ListItem>
        </StyledLink>

        <StyledLink to={"/profile"}>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <ManageAccountsIcon color={"primary"} />
                    </ListItemIcon>
                    <ListItemText primary={"Einstellungen"} />
                </ListItemButton>
            </ListItem>
        </StyledLink>
        <StyledListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                    <LogoutIcon color={"primary"} />
                </ListItemIcon>
                <ListItemText primary={"Logout"} />
            </ListItemButton>
        </StyledListItem>
        {isMobile && (
            <>
                <Divider />
                <StyledListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <CloseIcon color={"primary"} />
                        </ListItemIcon>
                        <ListItemText primary={"Schließen"} />
                    </ListItemButton>
                </StyledListItem>
            </>
        )}
        <Divider />
        <StyledLink to={"/changelog"}>
            <ListItemButton>
                <ListItemIcon>
                    <HelpOutline sx={{color: "dimgray"}} />
                </ListItemIcon>
                <ListItemText sx={{color: "dimgray"}} primary={`Version: ${appJson.version}`} />
            </ListItemButton>
        </StyledLink>
    </List>;
};

export default Navigation;