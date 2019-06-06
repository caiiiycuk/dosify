import { FileInput, H2, ProgressBar, Intent, H1 } from "@blueprintjs/core";

import React, { useState } from "react";
import JsDos from "../jsdos/JsDos";

import "./Dashboard.css";

const Dashboard: React.FC = () => {
    const [reader, setReader] = useState<FileReader|null>(null);
    const [loadProgress, setLoadProgress] = useState<number>(0);
    const [url, _setUrl] = useState<string | null>(null);
    
    const setUrl = (newUrl: string) => {
        if (url !== null) {
            URL.revokeObjectURL(url);
        }

        _setUrl(newUrl);
    }

    const loaded = url !== null;

    function onInputChange(e: any) {
        const files = e.currentTarget.files as FileList;
        if (files.length === 0) {
            setReader(null);
            return;
        }

        const file = files[0];
        var reader = new FileReader();
        reader.addEventListener('load', (e) => {
            const blob = new Blob([new Uint8Array(reader.result as ArrayBuffer)]);
            const url = URL.createObjectURL(blob);
            setUrl(url);
        });
        reader.addEventListener('progress', (e) => setLoadProgress(e.loaded / e.total));
        reader.readAsArrayBuffer(file);
        setReader(reader);
    }

    if (loaded) {
        return <div>
            <FileInput text="Choose file..." onInputChange={onInputChange} />
            <H1>Loaded</H1>
            <div className="js-dos-wrapper">
                <JsDos url={url as string} />
            </div>
        </div>;
    }

    return <div>
        <FileInput disabled={reader !== null} text="Choose file..." onInputChange={onInputChange} />
        {[reader].map(() => {
            if (reader === null){
                return "";
            }

            return <div key="optional">
                <ProgressBar value={loadProgress} intent={Intent.PRIMARY} />
            </div>;
        })}
    </div>;
};

export default Dashboard;
