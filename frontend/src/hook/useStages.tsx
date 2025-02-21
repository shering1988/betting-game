import useApi, {DeleteResponse, PostResponse, PutResponse} from "./useApi";
import StageResponse from "../types/response/StageResponse";
import StageRequest from "../types/request/StageRequest";

type StageApiResponse = {
    getData: (tournament: number, stage?: number) => Promise<StageResponse[]>
    putData: (data: StageRequest) => Promise<PutResponse>
    postData: (stage: number, data: StageRequest) => Promise<PostResponse>
    deleteData: (stage: number) => Promise<DeleteResponse>
}

const useStages = (): StageApiResponse => {
    const api = useApi();

    const getData = async (tournament: number, stage?: number): Promise<StageResponse[]> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/tournament/${tournament}/stage${stage ? `/${stage}` : ""}`);
    };

    const putData = async (data: StageRequest): Promise<PutResponse> => {
        return api.putData(`${process.env.REACT_APP_BASEURL}/stage`, data);
    };

    const postData = async (stage: number, data: StageRequest): Promise<PostResponse> => {
        return api.postData(`${process.env.REACT_APP_BASEURL}/stage/${stage}`, data);
    };

    const deleteData = async (stage: number): Promise<DeleteResponse> => {
        return api.deleteData(`${process.env.REACT_APP_BASEURL}/stage/${stage}`);
    };

    return {getData, putData, postData, deleteData};
};

export default useStages;