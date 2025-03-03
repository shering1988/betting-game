import useApi, {DeleteResponse, PostResponse, PutResponse} from "./useApi";
import TournamentResponse from "../types/response/TournamentResponse";
import TournamentRequest from "../types/request/TournamentRequest";

type TournamentApiResponse = {
    getData: (tournament?: number) => Promise<TournamentResponse[]>
    getActive: () => Promise<TournamentResponse>
    putData: (data: TournamentRequest) => Promise<PutResponse>
    postData: (tournament: number, data: TournamentRequest) => Promise<PostResponse>
    deleteData: (tournament: number) => Promise<DeleteResponse>
}

const useTournaments = (): TournamentApiResponse => {
    const api = useApi();

    const getData = async (tournament?: number): Promise<TournamentResponse[]> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/tournament${tournament ? `/${tournament}` : ""}`);
    };

    const getActive = async (): Promise<TournamentResponse> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/tournament/active`);
    };

    const putData = async (data: TournamentRequest): Promise<PutResponse> => {
        return api.putData(`${process.env.REACT_APP_BASEURL}/tournament`, data);
    };

    const postData = async (tournament: number, data: TournamentRequest): Promise<PostResponse> => {
        return api.postData(`${process.env.REACT_APP_BASEURL}/tournament/${tournament}`, data);
    };

    const deleteData = async (tournament: number): Promise<DeleteResponse> => {
        return api.deleteData(`${process.env.REACT_APP_BASEURL}/tournament/${tournament}`);
    };

    return {getActive, getData, putData, postData, deleteData};
};

export default useTournaments;