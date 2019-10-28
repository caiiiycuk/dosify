import React, { useState, useEffect } from "react";
import { DosCommandInterface } from "js-dos/dist/typescript/js-dos-ci";
import { Button, ButtonGroup } from "@blueprintjs/core";
import { heapsnapshot, heaprestore } from "../core/Snapshot";
import setTime from "../core/TimeMachine";

export interface ISnapshotControlProps {
    commandInterface: DosCommandInterface;
}

export default function Controls(props: ISnapshotControlProps) {
    const [snapshot, setSnapshot] = useState<ArrayBuffer | null>(null);
    const module = props.commandInterface.dos as any;

    useEffect(() => {
        return () => {

        };
    }, []);

    function takeSnapshot() {
        module.heapOperation = function() {
            delete module.heapOperation;
            heapsnapshot(module, (snapshot) => {
                setSnapshot(snapshot);
                // console.log("Snapshot size is ", snapshot.byteLength);

                // const a = document.createElement("a");
                // a.style.display = "none";
                // document.body.appendChild(a);

                // const blob = new Blob([snapshot], {type: "octet/stream"});
                // const url = URL.createObjectURL(blob);
                // a.href = url;
                // a.download = "dosbox.mem";
                // a.click();
                
                // URL.revokeObjectURL(url);
            });
        }
    }

    function restoreSnapshot() {
        module.heapOperation = function() {
            delete module.heapOperation;
            const time = heaprestore(module, snapshot as ArrayBuffer);
            setTime(time);
        }
    }

    return <div className="controls">
        <Button onClick={() => props.commandInterface.fullscreen()}>Fullscreen</Button>
    </div>;

    // return <div className="snapshot-control">
    //     <ButtonGroup>
    //         <Button onClick={takeSnapshot}>Take snapshot</Button>
    //         {snapshot === null ? "" : <Button onClick={restoreSnapshot}>Try snapshot</Button>}
    //     </ButtonGroup>
    // </div>;
}