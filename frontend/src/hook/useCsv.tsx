import useApi from "./useApi";

type DownloadResponse = {
    getData: (tournament: number) => Promise<Blob>
}

const useCsv = (): DownloadResponse => {
    const api = useApi();

    const getData = async (tournament: number): Promise<Blob> => {
        return api.downloadFile(`${process.env.REACT_APP_BASEURL}/ics-download/tournament/${tournament}`);
    };

    return {getData};
};

export default useCsv;