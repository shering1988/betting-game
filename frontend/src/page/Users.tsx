import React, {useContext} from "react";
import useUsers from "../hook/useUsers";
import UserResponse from "../types/response/UserResponse";
import Loader from "../components/Loader";
import User from "../components/User";
import {TournamentContext} from "../context/TournamentContext";

const Users: React.FC = () => {
    const usersApi = useUsers();
    const { tournament: storedTournament } = useContext(TournamentContext);
    const [users, setUsers] = React.useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorCode, setErrorCode] = React.useState<number | null>(null);
    const [hasChanged, setHasChanged] = React.useState<number>(0);

    React.useEffect(() => {
        usersApi.getData(storedTournament.id).then((users:UserResponse[]) => {
            setUsers(users);
            setIsLoading(false);
        }).catch((status: number) => {
            setErrorCode(status);
            setIsLoading(false);
        });
    }, [hasChanged]);

    if(errorCode && !isLoading) {
        setIsLoading(false);
        throw new Response("", {status: errorCode as number});
    }

    if(isLoading) {
        return <Loader />;
    }

    return <div>
        {users.map((user:UserResponse) => {
            return <User onChange={() => setHasChanged(hasChanged + 1)} user={user} key={user.id} />;
        })}
    </div>;
};

export default Users;