import React from "react";
import Avatar from "@mui/material/Avatar";
import TeamResponse from "../types/response/TeamResponse";
import CountUp from "react-countup";
import StyledLink from "../styledComponents/StyledLink";

export interface TeamListItemProps {
    team: TeamResponse,
    value: number | string,
}

const TeamListItem: React.FC<TeamListItemProps> = (props: TeamListItemProps) => {
    const { team, value } = props;

    return <div style={{padding: "0.5em", marginBottom: "0.5em", justifyContent: "space-between", width: "100%", backgroundColor: "#333333", borderRadius: "5px", display: "flex"}} key={`listItem-${team.id}`}>
        <div>
            <Avatar sx={{mr: "1em", width: "20px", height: "20px", filter: "grayscale(0.5)"}} src={`/assets/flags/${team.shortName.toLowerCase()}.png`} />
        </div>
        <div>
            <StyledLink to={`/team/${team.id}`}>
                {team.name.length > 10 ? team.name.substring(0, 10) + "\u2026" : team.name}
            </StyledLink>
        </div>
        <div>
            {
                typeof value === "number" ? <CountUp start={0} end={value} duration={2} /> : value
            }
        </div>
    </div>;
};

export default TeamListItem;