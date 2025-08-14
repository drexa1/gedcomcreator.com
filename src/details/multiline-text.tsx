import Linkify from "react-linkify";
import {ReactNode} from "react";


export function MultilineText({ lines }: { lines: (ReactNode | string)[] }) {
    return (
        <>
            {lines.map((line, index) =>
                <div className="description" key={index}>
                    <Linkify properties={{target: "_blank"}}>{line}</Linkify><br/>
                </div>
            )}
        </>
    );
}
