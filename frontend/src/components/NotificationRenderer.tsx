import React, {useContext} from "react";
import {NotificationContext} from "../context/NotificationContext";
import {Alert, Portal, Snackbar} from "@mui/material";

const NotificationRenderer: React.FC = () => {
    const { notification: notification } = useContext(NotificationContext);
    const [isOpen, setIsOpen] = React.useState<boolean>(true);

    React.useEffect(() => {
        if(notification) {
            setIsOpen(true);
        }
    }, [notification]);

    if(!notification)  {
        return null;
    }

    return <Portal>
        <Snackbar ClickAwayListenerProps={{onClickAway: () => null}} onClose={() => setIsOpen(false)} anchorOrigin={{vertical: "top", horizontal: "center"}} open={isOpen} autoHideDuration={3000}>
            <Alert severity={notification.type} sx={{whiteSpace: "pre-wrap"}}>
                {notification.message}
            </Alert>
        </Snackbar>
    </Portal>;
};

export default NotificationRenderer;