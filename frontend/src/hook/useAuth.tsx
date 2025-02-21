export type IUser = {
    username: string;
    token: string;
    isAdmin: boolean;
    id: number;
}

export type IAuth = {
    getUser: () => IUser | null;
    login: (username: string, password: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    verify: (url: string) => Promise<void>;
    resetPassword: (token: string, password: string, passwordRepeat: string) => Promise<void>;
    register: (username: string, password: string, passwordRepeat: string, email: string, secret: string, reminder: string) => Promise<void>;
    logout: () => void;
};

export type IResponse = {
    token: string | null;
    isAdmin: boolean;
    id: number;
}

const useAuth = (): IAuth => {
    const login = async (username: string, password: string): Promise<void> => {
        return await fetch(`${process.env.REACT_APP_BASEURL}/login_check`, {
            method: "POST",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password}),
        }).then((response) => {
            if(response.ok) {
                return response.json();
            } else {
                return Promise.reject();
            }
        }).then((data: IResponse) => {
            localStorage.setItem("user", JSON.stringify({id: data.id, isAdmin: data.isAdmin ,username: username, token: data.token}));
            return Promise.resolve();
        }).catch(() => {
            return Promise.reject();
        });
    };

    const register = async (username: string, password: string, passwordRepeat: string, email: string, secret: string, reminder: string): Promise<void> => {
        return await fetch(`${process.env.REACT_APP_BASEURL}/register`, {
            method: "PUT",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({name: username, password, passwordRepeat, email, secret, reminder: reminder === "on"}),
        }).then((response) => {
            if(response.ok) {
                return response.json();
            } else {
                return Promise.reject(response.status);
            }
        }).then((data: IResponse) => {
            localStorage.setItem("user", JSON.stringify({id: data.id, isAdmin: data.isAdmin ,username: username, token: data.token}));
            return Promise.resolve();
        }).catch((status: number) => {
            return Promise.reject(status);
        });
    };

    const verify = async (url: string): Promise<void> => {
        return await fetch(url, {
            method: "GET",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if(response.ok) {
                return Promise.resolve();
            } else {
                return Promise.reject(response.status);
            }
        }).catch((status: number) => {
            return Promise.reject(status);
        });
    };

    const forgotPassword = async (email: string): Promise<void> => {
        return await fetch(`${process.env.REACT_APP_BASEURL}/forgot-password`, {
            method: "PUT",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email}),
        }).then((response) => {
            if(response.ok) {
                return Promise.resolve();
            } else {
                return Promise.reject(response.status);
            }
        }).catch((status: number) => {
            return Promise.reject(status);
        });
    };

    const resetPassword = async (token: string, password: string, passwordRepeat: string): Promise<void> => {
        return await fetch(`${process.env.REACT_APP_BASEURL}/forgot-password/${token}`, {
            method: "POST",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({password, passwordRepeat}),
        }).then((response) => {
            if(response.ok) {
                return Promise.resolve();
            } else {
                return Promise.reject(response.status);
            }
        }).catch((status: number) => {
            return Promise.reject(status);
        });
    };

    const getUser = (): IUser | null => {
        if(localStorage.getItem("user")) {
            return JSON.parse(localStorage.getItem("user") ?? "") as IUser;
        }
        return null;
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("activeTournament");
    };

    return {getUser, login, logout, forgotPassword, register, resetPassword, verify};
};

export default useAuth;