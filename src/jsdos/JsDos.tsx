import React, { useRef, useEffect, useState } from "react";
import { DosFactory, DosRuntime } from "js-dos";

import "./JsDos.css";
import { ResizeSensor, IResizeEntry } from "@blueprintjs/core";
import { DosCommandInterface } from "js-dos/dist/typescript/js-dos-ci";

require("js-dos");
const Dos = (window as any).Dos as DosFactory;

export interface IJsDosProps {
    onRuntime: (runtime: DosRuntime) => Promise<DosCommandInterface>;
}

const JsDos = (props: IJsDosProps) => {
    const ref = useRef<HTMLCanvasElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (ref !== null) {
            console.warn("Use effect entered with", [ref/*, props.url, props.args*/]);
            const runtimePromise = Dos(ref.current as HTMLCanvasElement, {
                wdosboxUrl: "/wdosbox/wdosbox.js",
            });

            const ciPromise = runtimePromise.then(props.onRuntime);
            return () => {
                ciPromise.then(ci => {
                    console.log("EXITED");
                    ci.exit();
                });
            };
        }
    // eslint-disable-next-line
    }, [ref/*, props.url, props.args*/]);

    function onResize(entries: IResizeEntry[]) {
        if (entries.length > 0) {
            const canvas = ref.current as HTMLCanvasElement;
            const maxWidth = window.innerWidth;
            const maxHeight = entries[entries.length - 1].contentRect.height;

            const width = canvas.width;
            const height = canvas.height;

            const aspect = width / height;

            let newHeight = maxHeight;
            let newWidth = aspect * newHeight;
            
            if (newWidth > maxWidth) {
                newWidth = maxWidth;
                newHeight = newWidth / aspect;
            }

            setStyle({
                left: ((maxWidth - newWidth)) / 2 + "px",
                top: ((maxHeight - newHeight)) / 2 + "px",
                width: newWidth + "px",
                height: newHeight + "px",
            });
        }
    };

    return <ResizeSensor onResize={onResize}>
        <div className="jsdos-resize-sensor">
            <div style={style} className="jsdos-viewport">
                <canvas  className="js-dos-canvas" ref={ref} />
            </div>
        </div>
    </ResizeSensor>;
}

export default JsDos;