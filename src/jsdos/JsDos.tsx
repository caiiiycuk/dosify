import React, { useRef, useEffect } from "react";
import { DosFactory } from "js-dos";

import "./JsDos.css";
import { ResizeSensor, IResizeEntry } from "@blueprintjs/core";

require("js-dos");
const Dos = (window as any).Dos as DosFactory;

export interface IJsDosProps {
    url: string;
}

const JsDos = (props: IJsDosProps) => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (ref !== null) {
            const ciPromise = Dos(ref.current as HTMLCanvasElement, {
                wdosboxUrl: "/wdosbox/wdosbox.js",
            }).then((runtime) => {
                return runtime.fs.extract(props.url).then(() => {
                    return runtime.main(["-c", "DIGGER.COM"]);
                });
            });

            return () => {
                ciPromise.then(ci => ci.exit());
            };
        }
    }, [ref, props.url]);

    function onResize(entries: IResizeEntry[]) {
        if (entries.length > 0) {
            console.log(entries[entries.length - 1].contentRect);
        }
    };

    return <ResizeSensor onResize={onResize}>
            <canvas className="js-dos-canvas" ref={ref} />
        </ResizeSensor>;
}

export default JsDos;