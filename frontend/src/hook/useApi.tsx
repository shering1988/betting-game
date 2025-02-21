import useAuth from "./useAuth";
import {useNavigate} from "react-router-dom";

export type PutResponse = {
    message: string,
    resource: string
}

export type PostResponse = {
    message: string,
}

export type DeleteResponse = {
    message: string,
}

type ApiResponse = {
    fetchData: <T>(url: string) => Promise<T>,
    putData: <T>(url: string, data: T) => Promise<PutResponse>,
    postData: <T>(url: string, data: T) => Promise<PostResponse>,
    uploadFile: (url: string, data: File) => Promise<PostResponse>,
    deleteData: (url: string) => Promise<PostResponse>,
    downloadFile: (url: string) => Promise<Blob>,
}

const useApi = (): ApiResponse => {
    const auth = useAuth();
    const navigate = useNavigate();

    const fetchData = async <T,>(url: string): Promise<T> => {
        const response = await fetch(url, {
            method: "GET",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Authorization": `Bearer ${auth.getUser()?.token ?? ""}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json().then((jsonData: T) => {
            return jsonData;
        }).catch(() => {
            return Promise.reject(response.status);
        });

        if (response.ok) {
            return data;
        } else {
            if(response.status === 401) {
                auth.logout();
                navigate("/login");
                return Promise.reject();
            } else {
                return Promise.reject(response.status);
            }
        }
    };

    const putData = async <T,>(url: string, data: T): Promise<PutResponse> => {
        const response = await fetch(url, {
            method: "PUT",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Authorization": `Bearer ${auth.getUser()?.token ?? ""}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json().then((jsonData: PutResponse) => {
            return jsonData;
        }).catch(() => {
            return Promise.reject(response.status);
        });

        if (response.ok) {
            return responseData;
        } else {
            if(response.status === 401) {
                auth.logout();
                navigate("/login");
                return Promise.reject();
            } else {
                return Promise.reject(response.status);
            }
        }
    };

    const postData = async <T,>(url: string, data: T): Promise<PostResponse> => {
        const response = await fetch(url, {
            method: "POST",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Authorization": `Bearer ${auth.getUser()?.token ?? ""}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json().then((jsonData: PostResponse) => {
            return jsonData;
        }).catch(() => {
            return Promise.reject(response.status);
        });

        if (response.ok) {
            return responseData;
        } else {
            if(response.status === 401) {
                auth.logout();
                navigate("/login");
                return Promise.reject();
            } else {
                return Promise.reject(response.status);
            }
        }
    };

    const deleteData = async (url: string): Promise<DeleteResponse> => {
        const response = await fetch(url, {
            method: "DELETE",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Authorization": `Bearer ${auth.getUser()?.token ?? ""}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            return {message: "success"};
        } else {
            if(response.status === 401) {
                auth.logout();
                navigate("/login");
                return Promise.reject();
            } else {
                return Promise.reject(response.status);
            }
        }
    };

    const downloadFile = async (url: string): Promise<Blob> => {
        const response = await fetch(url, {
            method: "GET",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Authorization": `Bearer ${auth.getUser()?.token ?? ""}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.blob().then((blob: Blob) => {
            return blob;
        }).catch(() => {
            return Promise.reject(response.status);
        });

        if (response.ok) {
            return data;
        } else {
            if(response.status === 401) {
                auth.logout();
                navigate("/login");
                return Promise.reject();
            } else {
                return Promise.reject(response.status);
            }
        }
    };

    const uploadFile = async (url: string, data: File): Promise<PostResponse> => {
        const fileData = new FormData();
        fileData.append("profileImage", data);

        const response = await fetch(url, {
            method: "POST",
            cache: "no-cache",
            referrerPolicy: "no-referrer",
            headers: {
                "Authorization": `Bearer ${auth.getUser()?.token ?? ""}`
            },
            body: fileData
        });

        if (response.ok) {
            return {message: "success"};
        } else {
            if(response.status === 401) {
                auth.logout();
                navigate("/login");
                return Promise.reject();
            } else {
                return Promise.reject(response.status);
            }
        }
    };

    return {deleteData, putData, postData, fetchData, downloadFile, uploadFile};
};

export default useApi;