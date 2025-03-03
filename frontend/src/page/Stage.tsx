import React, {useContext} from "react";
import {useParams} from "react-router-dom";
import GameResponse from "../types/response/GameResponse";
import Loader from "../components/Loader";
import Game from "../components/Game";
import StageDetail from "../components/Stage";
import {Divider} from "@mui/material";
import {TournamentContext} from "../context/TournamentContext";
import useStages from "../hook/useStages";
import StageResponse from "../types/response/StageResponse";
import Box from "@mui/material/Box";

const Stage: React.FC = () => {
    const stageApi = useStages();
    const { stageId } = useParams();
    const [stage, setStage] = React.useState<StageResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [hasChanged, setHasChanged] = React.useState<number>(0);
    const { tournament: storedTournament } = useContext(TournamentContext);

    React.useEffect(() => {
        setIsLoading(true);
        stageApi.getData(storedTournament.id, stageId ? parseInt(stageId) : undefined).then((stages:StageResponse[]) => {
            setStage(stages[0]);
            setIsLoading(false);
        }).catch((status: number) => {
            setErrorCode(status);
            setIsLoading(false);
        });
    }, [stageId, hasChanged]);

    if((!isLoading && !stage) || errorCode) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    return <div>
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>GRUPPENINFORMATION</Divider>
        <StageDetail onChange={() => setHasChanged(hasChanged + 1)} stage={stage as StageResponse} />
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>SPIELE</Divider>
        <Box sx={{paddingTop: "1em", gap: "1em", flexWrap: "wrap", display: "flex", flexDirection: {xs: "column", sm: "row"}}}>
            {stage?.games.sort((a: GameResponse, b: GameResponse) => a.start.localeCompare(b.start)).map((game: GameResponse) => {
                if(game.tournament.id !== storedTournament.id) {
                    return;
                }
                return <Game onChange={() => setHasChanged(hasChanged + 1)} key={`team-game-${game.id}`} game={game} />;
            })}
        </Box>
    </div>;
};

export default Stage;