import React, { useRef, useEffect, useState } from "react";
import { DosFactory } from "js-dos";

import "./JsDos.css";
import { ResizeSensor, IResizeEntry } from "@blueprintjs/core";

require("js-dos");
const Dos = (window as any).Dos as DosFactory;

export interface IJsDosProps {
    url: string;
    args: string[];
}

const JsDos = (props: IJsDosProps) => {
    const ref = useRef<HTMLCanvasElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    console.log("ARGS!", props.args);

    useEffect(() => {
        if (ref !== null) {
            const ciPromise = Dos(ref.current as HTMLCanvasElement, {
                wdosboxUrl: "/wdosbox/wdosbox.js",
            }).then((runtime) => {
                return runtime.fs.extract(props.url).then(() => {
                    return runtime.main(props.args);
                });
            });

            return () => {
                ciPromise.then(ci => ci.exit());
            };
        }
    }, [ref, props.url, props.args]);

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

            console.log("recommended size", newWidth, newHeight, "in", entries[entries.length - 1].contentRect.height);
            setStyle({
                left: ((maxWidth - newWidth)) / 2 + "px",
                top: ((maxHeight - newHeight)) / 2 + "px",
                width: newWidth + "px",
                height: newHeight + "px",
            });
        }
    };

    return <ResizeSensor onResize={onResize}>
        <div className="jsdos-viewport">
            <canvas style={style} className="js-dos-canvas" ref={ref} />
        </div>
    </ResizeSensor>;
}

export default JsDos;