import BetResponse from "./BetResponse";
import FinalsBetResponse from "./FinalsBetResponse";

type UserResponse = {
    id: number,
    email: string,
    name: string,
    profileImage?: {
        id: string,
        path: string
    },
    bets: BetResponse[],
    finalsBets: FinalsBetResponse[],
    isEnabled: boolean,
    sendReminder: boolean,
}

export default UserResponse;