import React from "react";
import { DosCommandInterface } from "js-dos/dist/typescript/js-dos-ci";
import { Button } from "@blueprintjs/core";
import { heapsnapshot } from "../core/Snapshot";

export interface ISnapshotControlProps {
    commandInterface: DosCommandInterface;
}

export default function SnapshotControl(props: ISnapshotControlProps) {
    function takeSnapshot() {
        const module = props.commandInterface.dos as any;
        
        module.heapOperation = function() {
            delete module.heapOperation;
            heapsnapshot(module, (snapshot) => {
                console.log("Snapshot size is ", snapshot.byteLength);

                const a = document.createElement("a");
                a.style.display = "none";
                document.body.appendChild(a);

                const blob = new Blob([snapshot], {type: "octet/stream"});
                const url = URL.createObjectURL(blob);
                a.href = url;
                a.download = "dosbox.mem";
                a.click();
                
                URL.revokeObjectURL(url);
            });
        }
    }

    return <div>
        <Button onClick={takeSnapshot}>Take snapshot</Button>
    </div>;
}