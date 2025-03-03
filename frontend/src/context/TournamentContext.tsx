import {createContext, Dispatch, SetStateAction} from "react";
import TournamentResponse from "../types/response/TournamentResponse";

type TournamentContextType = {tournament: TournamentResponse, setTournament: Dispatch<SetStateAction<TournamentResponse>>};

export const TournamentContext = createContext<{tournament: TournamentResponse, setTournament: Dispatch<SetStateAction<TournamentResponse>>}>({} as TournamentContextType);