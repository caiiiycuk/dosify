import { FileInput, H2, ProgressBar, Intent, H1, H3, Spinner, Tree, ITreeNode, Classes, Icon, Button, ButtonGroup } from "@blueprintjs/core";

import React, { useState, useEffect } from "react";
import JsDos from "../jsdos/JsDos";

import Flexbox from 'flexbox-react';
import "./Dashboard.css";
import { REDO, PLAY } from "@blueprintjs/icons/lib/esm/generated/iconContents";
import ZipExecutables from "../core/ZipExplorer";
import { IconNames } from "@blueprintjs/icons";


const Dashboard: React.FC = () => {
    const [error, setError] = useState<string>("");
    const [reader, setReader] = useState<FileReader|null>(null);
    const [loadProgress, setLoadProgress] = useState<number>(0);
    const [url, _setUrl] = useState<string | null>(null);

    const [executables, setExecutables] = useState<ITreeNode[]>([]);
    const [executable, setExecutable] = useState<string | null>(null);
    const [argsLine, setArgsLine] = useState<string | null>(null);

    const [ready, setReady] = useState<boolean>(false);

    useEffect(() => {
        const fileName = executable;

        if (fileName === null) {
            return;
        }

        if (fileName.length === 0 || fileName === "N/A") {
            setArgsLine("");
            return;
        }

        const parts = fileName.split("/");
        const newArgs: string[] = [];
        parts.forEach((part, index) => {
            newArgs.push("\"-c\"");
            if (index < parts.length - 1) {
                newArgs.push("\"cd " + part + "\"");
            } else {
                newArgs.push("\"" + part + "\"");
            }
        });
        setArgsLine(newArgs.join(", "));
    }, [executable]);
    
    const setUrl = (newUrl: string) => {
        if (url !== null) {
            URL.revokeObjectURL(url);
        }

        _setUrl(newUrl);
    }

    function onInputChange(e: any) {
        const files = e.currentTarget.files as FileList;
        if (files.length === 0) {
            setReader(null);
            return;
        }

        setError("");

        const file = files[0];
        var reader = new FileReader();
        reader.addEventListener('load', async (e) => {
            const blob = new Blob([new Uint8Array(reader.result as ArrayBuffer)]);
            try {
                const files = await ZipExecutables(blob);
                const url = URL.createObjectURL(blob);
                setUrl(url);
                

                if (files.length === 1) {
                    setExecutable(files[0])
                } else if (files.length === 0) {
                    setExecutable("N/A");
                } else {
                    const nodes: ITreeNode[] = [];
                    for (const next of files) {
                        nodes.push({
                            id: next,
                            label: next,
                            icon: IconNames.PLAY,
                        });
                    }
                    setExecutables(nodes);
                }
            } catch (e) {
                setError(e);
                setReader(null);
                setLoadProgress(0);
            }
        });
        reader.addEventListener('progress', (e) => setLoadProgress(e.loaded / e.total));
        reader.readAsArrayBuffer(file);
        setReader(reader);
    }

    const chooseFileControl = <li>Upload 
        &nbsp;
        <span style={{color: "#D9822B", fontWeight: "bold", borderBottom: "2px solid #DB3737"}}>ZIP</span>
        &nbsp;
        archive of program
        <Flexbox className="instructions-control" flexDirection="row">
            <FileInput disabled={reader !== null} text="Choose file..." onInputChange={onInputChange} />
            &nbsp;&nbsp;
            <Spinner size={16} intent={Intent.PRIMARY} value={loadProgress} />
        </Flexbox>
        <span style={{color: "#DB3737", display: (error.length === 0 ? "none" : "block") }}>*&nbsp;{error}</span>
    </li>;

    const executablesControl = <li style={(executables.length === 0 && executable === null) ? {display: "none"} : {}}>
        Select executable:
        <div style={executable === null ? {} : {display: "none"}} className="instructions-control">
            <Tree className={Classes.ELEVATION_1} contents={executables} onNodeClick={(node) => setExecutable(node.id + "")} />
        </div>
        <div style={executable === null ? {display: "none"} : {}} className="instructions-control">
            <span style={{color: "#D9822B", fontWeight: "bold"}}>{executable}</span>
        </div>
    </li>;

    const argsControl = <li style={argsLine === null ? {display: "none"} : {}}>
        Check command line and 
        &nbsp;
        <span style={{color: "#D9822B", fontWeight: "bold", borderBottom: "2px solid #DB3737"}}>RUN</span>
        &nbsp;
        <ButtonGroup className="instructions-control">
            <input className={Classes.INPUT} value={argsLine + ""} onChange={(e) => setArgsLine(e.currentTarget.value)} />
            <Button intent={Intent.DANGER} text="Run" onClick={() => setReady(true)} />
        </ButtonGroup>
    </li>;

    const jsdos = <li style={ready ? {} : {display: "none"}}>
        Now PLAY!
        <JsDos url={url + ""}/>
    </li>

    return <Flexbox flexDirection="column" className="dashboard">
        <H1>Dosify me!</H1>
        <H3>Instructions</H3>
        <ol className="instructions-ol">
            {chooseFileControl}
            {executablesControl}
            {argsControl}
            {jsdos}
        </ol>
    </Flexbox>;
};

export default Dashboard;
