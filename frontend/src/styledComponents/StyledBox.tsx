import {css,styled} from "@mui/material";
import Box from "@mui/material/Box";

const StyledBox = styled(({ centerContent, ...rest }) => <Box {...rest} />)`  
    ${({ centerContent }) =>
        centerContent &&
            css`
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
          `
}
  
`;

export default StyledBox;