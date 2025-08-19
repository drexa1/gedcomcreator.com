import React, { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Icon } from "semantic-ui-react";

export const Dropzone = () => {
    const i18n = useIntl();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleUploadDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files.length > 0) {
            await handleFile(event.dataTransfer.files[0]);
        }
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            await handleFile(event.target.files[0]);
        }
    };

    const handleFile = async (newFile: File) => {
        setError(null);
        setFile(null);
        // Only accept .ged
        if (!newFile.name.toLowerCase().endsWith(".ged")) {
            setError(i18n.formatMessage({id: "dropzone.upload.error.invalidExtension", defaultMessage: "Only .ged files are supported"}));
        }
        // Check for empty
        if (newFile.size === 0) {
            setError(i18n.formatMessage({id: "dropzone.upload.error.emptyFile", defaultMessage: "File looks empty"}));
        }
        // Passed validations
        setFile(newFile);
        console.log(`${file!.name} valid. Follow to /view`);
    };

    return (
        <div className="ui upload-container">
            <div className="ui dropzone" onClick={handleUploadClick} onDrop={handleUploadDrop} onDragOver={(e) => e.preventDefault()}>
                <input type="file" accept=".ged" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }}/>
                <p>
                    <FormattedMessage id="dropzone.p.drag-n-drop" defaultMessage="Drag & drop your GEDCOM (.ged) file here, or "/>
                    <span>
                        <FormattedMessage id="dropzone.p.browse" defaultMessage="browse it"/>
                    </span>
                </p>
                {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
                <Button>
                    <Icon name="upload"/><FormattedMessage id="dropzone.button.browse-files" defaultMessage="Browse file"/>
                </Button>
            </div>
        </div>
    );
};
