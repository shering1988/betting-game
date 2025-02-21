import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import {AppBar, IconButton, Toolbar, Typography, Drawer, useMediaQuery, useTheme} from "@mui/material";
import useAuth from "../hook/useAuth";
import Navigation from "../components/Navigation";
import StyledBox from "../styledComponents/StyledBox";
import {useContext} from "react";
import {TournamentContext} from "../context/TournamentContext";

export type LayoutProps = {
    children?: React.ReactNode;
    centerContent?: boolean;
};

const Layout = (props: LayoutProps) => {
    const auth = useAuth();
    const drawerWidth = 240;
    const { centerContent = false } = props;
    const { tournament } = useContext(TournamentContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down(1400));

    const [showNavigation, setShowNavigation] = React.useState<boolean>(false);
    const container = window !== undefined ? () => window.document.body : undefined;

    const openNavigation = () => {
        setShowNavigation(true);
    };

    const closeNavigation = () => {
        setShowNavigation(false);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{my: 4, border: "0 solid teal"}}>
                {auth.getUser() && (
                    <Drawer
                        container={isMobile ? container : undefined}
                        open={showNavigation || !isMobile}
                        anchor={isMobile ? "right" : "left"}
                        ModalProps={{ onBackdropClick: closeNavigation }}
                        variant={isMobile ? "temporary" : "permanent"}
                        sx={{
                            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
                        }}
                    >
                        <Navigation isMobile={isMobile} onClose={closeNavigation} />
                    </Drawer>
                )}
                <AppBar position='static'>
                    <Toolbar>
                        <Box sx={{ width: "100%", justifyContent: "left", flex: "1" }}>
                            <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                                Betting Game
                            </Typography>
                            <Typography variant="body2" color="secondary">
                                {tournament.name}
                            </Typography>
                        </Box>
                        {(auth.getUser() && isMobile) && (
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={openNavigation}
                            >
                                <MenuIcon color={"primary"} />
                            </IconButton>
                        )}
                    </Toolbar>
                </AppBar>
            </Box>
            <StyledBox centerContent={centerContent}>
                {props.children}
            </StyledBox>
        </Container>
    );
};

export default Layout;