import { FileInput, Intent, H1, H3, Spinner, Tree, ITreeNode, Classes, Button, ButtonGroup, H4 } from "@blueprintjs/core";

import React, { useState, useEffect } from "react";
import JsDos from "../jsdos/JsDos";

import Flexbox from 'flexbox-react';
import "./Dashboard.css";
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
        archive of program (try&nbsp;<a href="/digger.zip">digger.zip</a>)
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

    const jsdos = ready ?
        <JsDos url={url + ""} args={(argsLine + "").split(", ").map((arg) => arg.trim().substr(1, arg.length - 2))}/> :
        <div></div>;

    return <Flexbox flexDirection="column" className="dashboard" style={ready ? {width: "100%"} : {}}>
        <H1>Dosify&nbsp;me!</H1>
        <H4>Try&nbsp;your&nbsp;favorite&nbsp;DOS&nbsp;game&nbsp;in&nbsp;browser</H4>
        <div style={ready ? {display: "none"} : {}}>
            <p>Instructions</p>
            <ol className="instructions-ol">
                {chooseFileControl}
                {executablesControl}
                {argsControl}
            </ol>
        </div>
        <Flexbox flexGrow={1} flexDirection="column" style={ready ? {} : {display: "none"}}>
            <H3>Now <span style={{color: "#D9822B", fontWeight: "bold", borderBottom: "2px solid #DB3737"}}>PLAY!</span></H3>
            {jsdos}
        </Flexbox>
    </Flexbox>;
};

export default Dashboard;
