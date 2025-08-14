import Linkify from "react-linkify";
import {ReactNode} from "react";

interface Props {
    lines: (ReactNode | string)[];
}

export function MultilineText(props: Props) {
    return (
        <>
            {props.lines.map((line, index) => (
                <div key={index}>
                    <Linkify properties={{target: "_blank"}}>{line}</Linkify>
                    <br/>
                </div>
            ))}
        </>
    );
}
