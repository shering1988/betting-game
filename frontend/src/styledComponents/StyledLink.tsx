import {styled, css} from "@mui/material";
import {Link} from "react-router-dom";

const StyledLink = styled(({ hasStroke, ...rest }) => <Link {...rest} />)`
    color: ${({ theme }) => theme.palette.common.white};
    text-decoration: none;
    &:hover {
        color: ${({ theme }) => theme.palette.primary.main};
    }
`;

export default StyledLink;