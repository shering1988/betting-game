import {styled} from "@mui/material";

const StyledLoader = styled("div")(({ theme }) => ({
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto",
    borderBottom: "2px solid #666666",
    padding: "3em",
    borderRadius: "5px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",

    "& span": {
        marginBottom: "1em",
    }
}));

export default StyledLoader;