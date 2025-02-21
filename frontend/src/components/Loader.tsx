import React from "react";
import {CircularProgress, Typography} from "@mui/material";
import StyledLoader from "../styledComponents/StyledLoader";

const Loader: React.FC = () => {
    return <StyledLoader>
        <CircularProgress color={"primary"} />
        <Typography>Daten werden geladen...</Typography>
    </StyledLoader>;
};

export default Loader;