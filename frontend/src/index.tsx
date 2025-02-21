import * as React from "react";
import * as ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "./config/routes";
import theme from "./config/theme";
import {Router as RemixRouter} from "@remix-run/router/dist/router";
import EnsureActiveTournament from "./hoc/EnsureActiveTournament";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import { deDE } from "@mui/x-date-pickers/locales";
import NotificationsProvider from "./hoc/NotificationsProvider";

const router: RemixRouter = createBrowserRouter(routes);
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
    <ThemeProvider theme={theme}>
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="de"
            localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <EnsureActiveTournament>
                <NotificationsProvider>
                    <CssBaseline />
                    <RouterProvider router={router} />
                </NotificationsProvider>
            </EnsureActiveTournament>
        </LocalizationProvider>
    </ThemeProvider>
);
