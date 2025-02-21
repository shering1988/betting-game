import {createTheme, Theme} from "@mui/material/styles";
import {teal} from "@mui/material/colors";

const theme: Theme = createTheme({
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: "#001010",
                },
            }
        },
    },
    palette: {
        mode: "dark",
        primary: teal,
        secondary: teal
    }
});

export default theme;