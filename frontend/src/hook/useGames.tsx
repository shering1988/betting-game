import useApi, {DeleteResponse, PostResponse, PutResponse} from "./useApi";
import GameResponse from "../types/response/GameResponse";
import GameRequest from "../types/request/GameRequest";

type GamesApiResponse = {
    getData: (tournament: number, game?: number) => Promise<GameResponse[]>
    putData: (data: GameRequest) => Promise<PutResponse>
    postData: (game: number, data: GameRequest) => Promise<PostResponse>
    deleteData: (game: number) => Promise<DeleteResponse>
}

const useGames = (): GamesApiResponse => {
    const api = useApi();

    const getData = async (tournament: number, game?: number): Promise<GameResponse[]> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/tournament/${tournament}/game${game ? `/${game}` : ""}`);
    };

    const putData = async (data: GameRequest): Promise<PutResponse> => {
        return api.putData(`${process.env.REACT_APP_BASEURL}/game`, data);
    };

    const postData = async (game: number, data: GameRequest): Promise<PostResponse> => {
        return api.postData(`${process.env.REACT_APP_BASEURL}/game/${game}`, data);
    };

    const deleteData = async (game: number): Promise<DeleteResponse> => {
        return api.deleteData(`${process.env.REACT_APP_BASEURL}/game/${game}`);
    };

    return {getData, putData, postData, deleteData};
};

export default useGames;