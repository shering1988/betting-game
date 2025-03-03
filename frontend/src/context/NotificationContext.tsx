import {createContext, Dispatch, SetStateAction} from "react";
import Notification from "../types/Notification";

type NotificationContextType = {notification: Notification | null, setNotification: Dispatch<SetStateAction<Notification | null>>};

export const NotificationContext = createContext<{notification: Notification | null, setNotification: Dispatch<SetStateAction<Notification | null>>}>({} as NotificationContextType);