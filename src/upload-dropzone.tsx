import React, {ChangeEvent, DragEvent, useRef, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {Button, Icon} from "semantic-ui-react";
import {CouldNotReadError, EmptyFileError, uploadValidation} from "./upload-validate";
import {MessageState} from "./app";
import {useValidationFilenames} from "./upload-validate-filenames";

export const UploadDropzone = ({ showMessage }: { showMessage: (message: MessageState) => void }) => {
    const i18n = useIntl();
    const validationFilenames = useValidationFilenames();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [fileErrors, setFileErrors] = useState<Record<string, string | null>>(
        Array.from(validationFilenames).reduce((acc, filename) => {
            acc[filename] = null;
            return acc;
        }, {})
    );  // Initialize dict from the keys from validationFilenames

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
        uploadValidation(newFiles, files, validationFilenames, (validFiles, errors) => {
            // add to previous files
            setFiles([...files, ...validFiles]);
            // error handling
            errors.forEach(error => {
                if(error instanceof CouldNotReadError) {
                    const formattedMessage = i18n.formatMessage({ id: "dropzone.upload.error.CouldNotReadError", defaultMessage: "Could not be read" })
                    setFileErrors(prevErrors => ({...prevErrors, [error.message]: formattedMessage}));
                }
                if(error instanceof EmptyFileError) {
                    const formattedMessage = i18n.formatMessage({ id: "dropzone.upload.error.EmptyFileError", defaultMessage: "Looks empty" })
                    setFileErrors(prevErrors => ({...prevErrors, [error.message]: formattedMessage}));
                }
                console.error(error);
            });
        });
    }

    function getFileEmoji(filename: string) {
        return files.some(f => f.name === filename) ? (
            <span >🎉</span>
        ) : fileErrors[filename] ? (
            <span className="needed-files-emoji" data-tooltip={fileErrors[filename]}>⚠️</span>
        ) : <></>  // don't display anything specifically
    }

    function enableSubmit(): boolean {
        return files.length === validationFilenames.size && Object.keys(fileErrors).length === 0;
    }

    function submitFiles() {
        console.info("There goes the files 🚀")
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
            <Button primary disabled={!enableSubmit()} onClink={submitFiles()}>
                <FormattedMessage id="dropzone.button.submit" defaultMessage="Submit"/>
            </Button>
        </div>
    );
};