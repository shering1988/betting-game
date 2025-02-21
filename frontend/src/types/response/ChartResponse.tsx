import UserResponse from "./UserResponse";

type ChartResponse = {
    lines: {
        id: string,
        name: string,
        color: string
    }[],
    users: {
        user: Pick<UserResponse, "id" | "name" | "profileImage">,
        score: number[]
    }[]
}

export default ChartResponse;