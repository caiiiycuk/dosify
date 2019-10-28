import React, { useState } from "react";

import "./Player.css";
import { H3, Divider, ButtonGroup, Button } from "@blueprintjs/core";
import Flexbox from "flexbox-react";
import { IconNames } from "@blueprintjs/icons";
import JsDos from "../jsdos/JsDos";
import { DosRuntime } from "js-dos";

export default function Player() {
    const [firstWindowOnTop, setFirstWindowOnTop] = useState<boolean>(true);
    const [firstWindowIteration, setFirstWindowIteration] = useState<number>(0);
    const [secondWindowIteration, setSecondWindowIteration] = useState<number>(0);

    

    const onRepeat = () => {
        if (firstWindowOnTop) {
            setFirstWindowIteration(firstWindowIteration + 1);
        } else {
            setSecondWindowIteration(secondWindowIteration + 1);
        }

        setFirstWindowOnTop(!firstWindowOnTop);
    }

    const onRuntime = async (runtime: DosRuntime, it: number) => {
        await runtime.fs.extract("digger.zip");
        if (it % 2 === 0) {
            return runtime.main(["-c", "digger.com"]);
        }

        return runtime.main();
    }

    const header =
        <Flexbox className="header">
            <H3>Dosify, me!</H3>
            <div style={{flexGrow: 1}}></div>
            <ButtonGroup>
                <Button minimal={true} icon={IconNames.STAR_EMPTY} />
                <Button minimal={true} icon={IconNames.REPEAT} onClick={onRepeat} />
                <Button minimal={true} icon={IconNames.SOCIAL_MEDIA} />
            </ButtonGroup>
        </Flexbox>;

    return <Flexbox flexDirection="column" className="playerContent">
        {header}
        <Divider />
        <div className="playerContainer">
            <div className="playerWindow" style={{zIndex: firstWindowOnTop ? 1 : 0}}>
                <JsDos key={"dos_" + firstWindowIteration} onRuntime={(r) => onRuntime(r, firstWindowIteration)}></JsDos>
            </div>
            <div className="playerWindow" style={{zIndex: firstWindowOnTop ? 0 : 1}}>
                <JsDos key={"dos_" + secondWindowIteration} onRuntime={(r) => onRuntime(r, secondWindowIteration)}></JsDos>
            </div>
        </div>
    </Flexbox>;
}