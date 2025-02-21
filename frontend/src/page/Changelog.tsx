import React from "react";
import {Typography} from "@mui/material";
import Card from "@mui/material/Card";
import Markdown from "react-markdown";
import markdown from "../CHANGELOG.md";
import StyledChangelog from "../styledComponents/StyledChangelog";

const Changelog: React.FC = () => {
    const [ content, setContent] = React.useState<string>("");

    React.useEffect(()=> {
        fetch(markdown)
            .then((res) => res.text())
            .then((md) => {
                setContent(md);
            });
    }, []);

    return <div>
        <Card
            variant="outlined"
            sx={{
                p: 2,
                backgroundColor: "rgba(255, 255, 255, 0.05)"
            }}
        >
            <StyledChangelog>
                <Typography variant="body1">
                    <Markdown>{content}</Markdown>
                </Typography>
            </StyledChangelog>
        </Card>
    </div>;
};

export default Changelog;