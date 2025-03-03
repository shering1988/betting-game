import useApi, {DeleteResponse, PostResponse, PutResponse} from "./useApi";
import FinalsBetResponse from "../types/response/FinalsBetResponse";
import FinalsBetRequest from "../types/request/FinalsBetRequest";

type FinalsBetApiResponse = {
    getData: (tournament: number) => Promise<FinalsBetResponse[]>
    putData: (data: FinalsBetRequest) => Promise<PutResponse>
    postData: (finalsBet: number, data: FinalsBetRequest) => Promise<PostResponse>
    deleteData: (finalsBet: number) => Promise<DeleteResponse>
}

const useFinalsBets = (): FinalsBetApiResponse => {
    const api = useApi();

    const getData = async (tournament: number): Promise<FinalsBetResponse[]> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/tournament/${tournament}/finalsBet`);
    };

    const putData = async (data: FinalsBetRequest): Promise<PutResponse> => {
        return api.putData(`${process.env.REACT_APP_BASEURL}/finalsBet`, data);
    };

    const postData = async (finalsBet: number, data: FinalsBetRequest): Promise<PostResponse> => {
        return api.postData(`${process.env.REACT_APP_BASEURL}/finalsBet/${finalsBet}`, data);
    };

    const deleteData = async (finalsBet: number): Promise<DeleteResponse> => {
        return api.deleteData(`${process.env.REACT_APP_BASEURL}/finalsBet/${finalsBet}`);
    };


    return {getData, postData, putData, deleteData};
};

export default useFinalsBets;