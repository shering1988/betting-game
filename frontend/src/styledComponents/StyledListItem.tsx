import {ListItem, styled} from "@mui/material";

const StyledListItem = styled(ListItem)(({ theme }) => ({
    color: theme.palette.common.white,
    textDecoration: "none",
    "&:hover": {
        color: theme.palette.primary.main,
    },
}));

export default StyledListItem;