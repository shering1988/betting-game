import React from "react";
import Avatar from "@mui/material/Avatar";
import CountUp from "react-countup";
import UserResponse from "../types/response/UserResponse";
import NoProfileImage from "../assets/no-profile-image.png";
import StyledLink from "../styledComponents/StyledLink";

export interface UserListItemProps {
    user: UserResponse,
    value: number | string,
}

const UserListItem: React.FC<UserListItemProps> = (props: UserListItemProps) => {
    const { user, value } = props;

    return <div style={{padding: "0.5em", marginBottom: "0.5em", justifyContent: "space-between", width: "100%", backgroundColor: "#333333", borderRadius: "5px", display: "flex"}} key={`listItem-${user.id}`}>
        <div>
            <Avatar sx={{mr: "1em", width: "20px", height: "20px", filter: "grayscale(0.5)"}} src={user.profileImage ? user.profileImage.path : NoProfileImage} />
        </div>
        <div>
            <StyledLink to={`/user/${user.id}`}>
                {user.name.length > 10 ? user.name.substring(0, 10) + "\u2026" : user.name}
            </StyledLink>
        </div>
        <div>
            {
                typeof value === "number" ? <CountUp start={0} end={value} duration={2} /> : value
            }
        </div>
    </div>;
};

export default UserListItem;