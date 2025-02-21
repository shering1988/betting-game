import useApi from "./useApi";
import RankingResponse from "../types/response/RankingResponse";
import ChartResponse from "../types/response/ChartResponse";

type RankingApiResponse = {
    getData: (tournament: number) => Promise<RankingResponse[]>,
    getChartData: (tournament: number) => Promise<ChartResponse>
}

const useRanking = (): RankingApiResponse => {
    const api = useApi();

    const getData = async (tournament: number): Promise<RankingResponse[]> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/ranking/tournament/${tournament}`);
    };

    const getChartData = async (tournament: number): Promise<ChartResponse> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/chart/tournament/${tournament}`);
    };

    return {getData, getChartData};
};

export default useRanking;