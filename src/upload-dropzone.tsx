import React, {ChangeEvent, DragEvent, ReactElement, useRef, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {Button, Icon} from "semantic-ui-react";
import {uploadValidation} from "./upload-validate";
import {MessageState} from "./app";
import {CouldNotReadError, EmptyFileError, MissingColumnsError, useValidationSchemas} from "./upload-validate-schemas";

export const UploadDropzone = ({ showMessage }: { showMessage: (message: MessageState) => void }) => {
    const i18n = useIntl();
    const validationSchemas = useValidationSchemas();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [fileErrors, setFileErrors] = useState<Record<string, string | null>>(Object.fromEntries(Object.keys(validationSchemas).map(key => [key, null])));


    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleUploadDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        await HandleFiles(event.dataTransfer.files);
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        await HandleFiles(event.target.files!);
    };

    const HandleFiles = async (newFiles: FileList) => {
        uploadValidation(newFiles, files, validationSchemas, (validFiles, errors) => {
            // add to previous files
            setFiles([...files, ...validFiles]);
            // error handling
            errors.forEach(error => {
                switch (true) {
                    case error instanceof CouldNotReadError || error instanceof EmptyFileError:
                        setFileErrors(prevErrors => ({...prevErrors, [error.message]: error.constructor.name}));
                        break;
                    case error instanceof MissingColumnsError:
                        setFileErrors(prevErrors => ({...prevErrors, [error.message]: error.constructor.name}));
                        break;
                    default:
                        console.error("Unknown error:", error);
                        break;
                }
            });
        });
    }

    function getFileEmoji(filename: string) {
        return files.some(f => f.name === filename) ? (
            <span >🎉</span>
        ) : fileErrors[filename] ? (
            <span className="needed-files-emoji" data-tooltip={fileErrors[filename]}>⚠️</span>  // TODO: replace by i18n formatted message
        ) : null  // don't display anything specifically
    }

    return (
        <div className="ui upload-container">
            <div
                className="ui dropzone"
                onClick={handleUploadClick}
                onDrop={handleUploadDrop}
                onDragOver={(e) => e.preventDefault()}>
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} style={{display: "none"}}/>
                <p>
                    <FormattedMessage id="dropzone.p.drag-n-drop" defaultMessage="Drag & drop here your filled assets.templates, or "/>
                    <span><FormattedMessage id="dropzone.p.browse-them" defaultMessage="browse them"/></span>
                </p>
                <p style={{marginBottom: 10}}><FormattedMessage id="dropzone.p.files-needed" defaultMessage="We need all the 3 files:"/></p>
                <div style={{display: "flex"}}>
                    {/* Needed files */}
                    <div className="needed-files">
                        <p><FormattedMessage id="individuals.csv"   defaultMessage="1-individuals.csv"/></p>
                        <p><FormattedMessage id="parents.csv"       defaultMessage="2-parents.csv"/></p>
                        <p><FormattedMessage id="relationships.csv" defaultMessage="3-relationships.csv"/></p>
                    </div>
                    {/* Success/warning emojis */}
                    <div className="needed-files-emojis">
                        <p>&nbsp;&nbsp;{getFileEmoji(i18n.formatMessage({ id: "individuals.csv",   defaultMessage: "1-individuals.csv" }))}</p>
                        <p>&nbsp;&nbsp;{getFileEmoji(i18n.formatMessage({ id: "parents.csv",       defaultMessage: "2-parents.csv" }))}</p>
                        <p>&nbsp;&nbsp;{getFileEmoji(i18n.formatMessage({ id: "relationships.csv", defaultMessage: "3-relationships.csv" }))}</p>
                    </div>
                </div>

                <Button>
                    <Icon name="upload"/>
                    <FormattedMessage id="dropzone.button.browse-files" defaultMessage="Browse files"/>
                </Button>
            </div>
            <Button primary disabled={true}>
                <FormattedMessage id="dropzone.button.submit" defaultMessage="Submit"/>
            </Button>
        </div>
    );
};