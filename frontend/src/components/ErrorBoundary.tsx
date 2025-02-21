import React from "react";
import {useRouteError} from "react-router-dom";
import Error from "../page/Error";
import {ERROR_404_RESOURCE, ERROR_400, ERROR_401, ERROR_GENERIC, ERROR_403} from "../constants/ErrorMessages";

type ErrorResponse = {
    status: number;
}

const ErrorBoundary: React.FC = () => {
    const error: ErrorResponse = useRouteError() as ErrorResponse;

    let message = "";
    switch(error.status) {
    case 400:
        message = ERROR_400;
        break;
    case 401:
        message = ERROR_401;
        break;
    case 403:
        message = ERROR_403;
        break;
    case 404:
        message = ERROR_404_RESOURCE;
        break;
    default:
        message = ERROR_GENERIC;
        break;
    }

    return <Error number={error.status ?? 600} message={message} />;
};

export default ErrorBoundary;