import React from "react";
import Layout from "../hoc/Layout";
import StyledError from "../styledComponents/StyledError";

type ErrorProps = {
    number: number,
    message: string,
}

const Error: React.FC<ErrorProps> = (props: ErrorProps) => {
    const { number, message } = props;

    return <Layout centerContent={true}>
        <StyledError>
            <div className={"errorNumber"}>{number}</div>
            <div className={"errorText"}>{message}</div>
        </StyledError>
    </Layout>;
};

export default Error;