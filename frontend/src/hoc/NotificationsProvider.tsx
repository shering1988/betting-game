import React from "react";
import Notification from "../types/Notification";
import {NotificationContext} from "../context/NotificationContext";
import NotificationRenderer from "../components/NotificationRenderer";

const NotificationsProvider: React.FC<{children?: React.ReactNode}> = (props) => {
    const [notification, setNotification] = React.useState<Notification | null>(null);

    return (
        <NotificationContext.Provider value={{notification: notification, setNotification: setNotification}}>
            <NotificationRenderer />
            {props.children}
        </NotificationContext.Provider>
    );
};

export default NotificationsProvider;