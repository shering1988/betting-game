import useApi, {DeleteResponse, PostResponse, PutResponse} from "./useApi";
import BetRequest from "../types/request/BetRequest";

type BetApiResponse = {
    putData: (data: BetRequest) => Promise<PutResponse>
    postData: (bet: number, data: BetRequest) => Promise<PostResponse>
    deleteData: (bet: number) => Promise<DeleteResponse>
}

const useBets = (): BetApiResponse => {
    const api = useApi();

    const putData = async (data: BetRequest): Promise<PutResponse> => {
        return api.putData(`${process.env.REACT_APP_BASEURL}/bet`, data);
    };

    const postData = async (bet: number, data: BetRequest): Promise<PostResponse> => {
        return api.postData(`${process.env.REACT_APP_BASEURL}/bet/${bet}`, data);
    };

    const deleteData = async (bet: number): Promise<DeleteResponse> => {
        return api.deleteData(`${process.env.REACT_APP_BASEURL}/bet/${bet}`);
    };

    return {putData, postData, deleteData};
};

export default useBets;