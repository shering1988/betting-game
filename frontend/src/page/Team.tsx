import React, {useContext} from "react";
import useTeams from "../hook/useTeams";
import TeamResponse from "../types/response/TeamResponse";
import {useParams} from "react-router-dom";
import GameResponse from "../types/response/GameResponse";
import Loader from "../components/Loader";
import Game from "../components/Game";
import TeamDetail from "../components/Team";
import {Divider} from "@mui/material";
import {TournamentContext} from "../context/TournamentContext";
import Box from "@mui/material/Box";

const Team: React.FC = () => {
    const teamsApi = useTeams();
    const { teamId } = useParams();
    const [team, setTeam] = React.useState<TeamResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [hasChanged, setHasChanged] = React.useState<number>(0);
    const { tournament: storedTournament } = useContext(TournamentContext);

    React.useEffect(() => {
        setIsLoading(true);
        teamsApi.getData(storedTournament.id, teamId ? parseInt(teamId) : undefined).then((teams:TeamResponse[]) => {
            setTeam(teams[0]);
            setIsLoading(false);
        }).catch((status: number) => {
            setErrorCode(status);
            setIsLoading(false);
        });
    }, [teamId, hasChanged]);

    if((!isLoading && !team) || errorCode) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    return <div>
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>TEAMINFORMATIONEN</Divider>
        <TeamDetail onChange={() => setHasChanged(hasChanged + 1)} team={team as TeamResponse} />
        <Divider sx={{marginTop: "1em", marginBottom: "1em"}}>SPIELE</Divider>
        <Box sx={{paddingTop: "1em", gap: "1em", flexWrap: "wrap", display: "flex", flexDirection: {xs: "column", sm: "row"}}}>
            {team?.games.sort((a: GameResponse, b: GameResponse) => a.start.localeCompare(b.start)).map((game: GameResponse) => {
                if(game.tournament.id !== storedTournament.id) {
                    return;
                }
                return <Game onChange={() => setHasChanged(hasChanged + 1)} key={`team-game-${game.id}`} game={game} />;
            })}
        </Box>
    </div>;
};

export default Team;