import useApi, {DeleteResponse, PostResponse, PutResponse} from "./useApi";
import TeamResponse from "../types/response/TeamResponse";
import TeamRequest from "../types/request/TeamRequest";

type TeamsApiResponse = {
    getData: (tournament: number, teamId?: number) => Promise<TeamResponse[]>
    putData: (data: TeamRequest) => Promise<PutResponse>
    postData: (team: number, data: TeamRequest) => Promise<PostResponse>
    deleteData: (team: number) => Promise<DeleteResponse>
}

const useTeams = (): TeamsApiResponse => {
    const api = useApi();

    const getData = async (tournament: number, teamId?: number): Promise<TeamResponse[]> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/tournament/${tournament}/team${teamId ? `/${teamId}` : ""}`);
    };

    const putData = async (data: TeamRequest): Promise<PutResponse> => {
        return api.putData(`${process.env.REACT_APP_BASEURL}/team`, data);
    };

    const postData = async (team: number, data: TeamRequest): Promise<PostResponse> => {
        return api.postData(`${process.env.REACT_APP_BASEURL}/team/${team}`, data);
    };

    const deleteData = async (team: number): Promise<DeleteResponse> => {
        return api.deleteData(`${process.env.REACT_APP_BASEURL}/team/${team}`);
    };

    return {getData, putData, postData, deleteData};
};

export default useTeams;