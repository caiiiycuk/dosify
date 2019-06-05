import React, { useRef, useEffect } from "react";

import { DosFactory } from "js-dos";
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
                wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js",
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

    return <canvas ref={ref} />;
}

export default JsDos;