import React from "react";
import useAuth from "../hook/useAuth";
import {TournamentContext} from "../context/TournamentContext";
import TournamentResponse from "../types/response/TournamentResponse";

const EnsureActiveTournament: React.FC<{children?: React.ReactNode}> = (props) => {
    const auth = useAuth();

    const storedTournament = JSON.parse(localStorage.getItem("activeTournament") ?? "{}") as TournamentResponse;
    const [tournament, setTournament] = React.useState<TournamentResponse>(storedTournament);

    React.useEffect(() => {
        if((!localStorage.getItem("activeTournament") || !tournament) && auth.getUser()) {
            auth.logout();
            window.location.href = "/login";
        }
    }, [localStorage.getItem("activeTournament"), tournament]);

    return (
        <TournamentContext.Provider value={{tournament: tournament, setTournament: setTournament}}>
            {props.children}
        </TournamentContext.Provider>
    );
};

export default EnsureActiveTournament;