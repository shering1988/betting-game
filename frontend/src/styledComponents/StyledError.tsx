import {styled} from "@mui/material";

const StyledError = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    "& .errorNumber": {
        color: theme.palette.primary.main,
        fontSize: "12em",
        fontWeight: 700,
        opacity: 0.2
    },

    "& .errorText": {
        fontSize: "2.5em",
        marginTop: "-2.8em",
        textAlign: "center"
    },
}));

export default StyledError;