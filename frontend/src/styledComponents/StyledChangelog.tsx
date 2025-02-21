import {styled} from "@mui/material";
import Box from "@mui/material/Box";

const StyledChangelog = styled(Box)(({ theme }) => ({
    "& h1, h2, h3": {
        margin: 0,
        fontWeight: 400,
        letterSpacing: "0em",
        lineHeight: "1.334",
    },

    "& h1": {
        color: theme.palette.primary.main,
        fontSize: "1.5rem",
    },

    "& h2": {
        color: theme.palette.primary.main,
        fontSize: "1.2rem",
        margin: "1em"
    },

    "& h3": {
        fontWeight: 700,
        fontSize: "1.1rem",
        margin: "1em"
    },
}));

export default StyledChangelog;