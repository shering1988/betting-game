import useApi, {PostResponse} from "./useApi";
import UserResponse from "../types/response/UserResponse";
import UserRequest from "../types/request/UserRequest";

type UserApiResponse = {
    getData: (tournament: number, user?: number) => Promise<UserResponse[]>
    postData: (user: number, data: UserRequest) => Promise<PostResponse>
    toggleUser: (user: number) => Promise<PostResponse>
    uploadProfileImage: (user: number, data: File) => Promise<PostResponse>
}

const useUsers = (): UserApiResponse => {
    const api = useApi();

    const getData = async (tournament: number, user?: number): Promise<UserResponse[]> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/tournament/${tournament}/user${user ? `/${user}` : ""}`);
    };

    const postData = async (user: number, data: UserRequest): Promise<PostResponse> => {
        return api.postData(`${process.env.REACT_APP_BASEURL}/user/${user}`, data);
    };

    const uploadProfileImage = async (user: number, data: File): Promise<PostResponse> => {
        return api.uploadFile(`${process.env.REACT_APP_BASEURL}/user/${user}/upload`, data);
    };

    const toggleUser = async (user: number): Promise<PostResponse> => {
        return api.postData(`${process.env.REACT_APP_BASEURL}/user/${user}/toggle`, undefined);
    };

    return {getData, uploadProfileImage, postData, toggleUser};
};

export default useUsers;