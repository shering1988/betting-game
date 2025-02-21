import Login from "../page/Login";
import Ranking from "../page/Ranking";
import Games from "../page/Games";
import Game from "../page/Game";
import * as React from "react";
import ProtectedPage from "../hoc/ProtectedPage";
import ProtectedAdminPage from "../hoc/ProtectedAdminPage";
import Tournaments from "../page/Tournaments";
import Rules from "../page/Rules";
import Profile from "../page/Profile";
import Teams from "../page/Teams";
import Team from "../page/Team";
import Users from "../page/Users";
import User from "../page/User";
import Stages from "../page/Stages";
import Stage from "../page/Stage";
import FinalsBets from "../page/FinalsBets";
import Error from "../page/Error";
import ErrorBoundary from "../components/ErrorBoundary";
import {ERROR_404_PAGE} from "../constants/ErrorMessages";
import ForgotPassword from "../page/ForgotPassword";
import Register from "../page/Register";
import Verify from "../page/Verify";
import ResetPassword from "../page/ResetPassword";
import Statistics from "../page/Statistics";
import Changelog from "../page/Changelog";

const routes = [
    {
        path: "/",
        element: <ProtectedPage><Ranking /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/forgot-password/:token",
        element: <ResetPassword />,
    },
    {
        path: "/verify",
        element: <Verify />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/ranking",
        element: <ProtectedPage><Ranking /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/changelog",
        element: <ProtectedPage><Changelog /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/statistics",
        element: <ProtectedPage><Statistics /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/tournaments",
        element: <ProtectedPage><Tournaments /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/stages",
        element: <ProtectedAdminPage><Stages /></ProtectedAdminPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/stage/:stageId",
        element: <ProtectedPage><Stage /></ProtectedPage>,
        errorElement: <ErrorBoundary />,
    },
    {
        path: "/finalsBets",
        element: <ProtectedPage><FinalsBets /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/teams",
        element: <ProtectedAdminPage><Teams /></ProtectedAdminPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/team/:teamId",
        element: <ProtectedPage><Team /></ProtectedPage>,
        errorElement: <ErrorBoundary />,
    },
    {
        path: "/users",
        element: <ProtectedAdminPage><Users /></ProtectedAdminPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/user/:userId",
        element: <ProtectedPage><User /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/rules",
        element: <ProtectedPage><Rules /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/games",
        element: <ProtectedPage><Games /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/game/:gameId",
        element: <ProtectedPage><Game /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/game/:gameId/edit",
        element: <ProtectedAdminPage><Game /></ProtectedAdminPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "/profile",
        element: <ProtectedPage><Profile /></ProtectedPage>,
        errorElement: <ErrorBoundary />
    },
    {
        path: "*",
        element: <Error number={404} message={ERROR_404_PAGE} />,
        errorElement: <ErrorBoundary />
    }
];

export default routes;