import useApi from "./useApi";
import StatisticsResponse from "../types/response/StatisticsResponse";

type StatisticsApiResponse = {
    getData: (tournament?: number) => Promise<StatisticsResponse>
}

const useTournaments = (): StatisticsApiResponse => {
    const api = useApi();

    const getData = async (tournament?: number): Promise<StatisticsResponse> => {
        return api.fetchData(`${process.env.REACT_APP_BASEURL}/statistics/tournament/${tournament}`);
    };

    return {getData};
};

export default useTournaments;