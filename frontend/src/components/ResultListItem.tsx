import React from "react";
import CountUp from "react-countup";

export interface ResultListItemProps {
    result: string,
    value: number,
}

const ResultListItem: React.FC<ResultListItemProps> = (props: ResultListItemProps) => {
    const { result, value } = props;

    return <div style={{padding: "0.5em", marginBottom: "0.5em", justifyContent: "space-between", width: "100%", backgroundColor: "#333333", borderRadius: "5px", display: "flex"}} key={`listItem-${result}`}>
        <div>{result}</div>
        <div>
            <CountUp start={0} end={value} duration={2} />
        </div>
    </div>;
};

export default ResultListItem;