import React, {ChangeEvent, DragEvent, useRef, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {Button, Icon} from "semantic-ui-react";
import {CouldNotReadError, EmptyFileError, MissingColumnsError, uploadValidation} from "./upload-validate";
import {useValidationSchemas} from "./upload-validate-schemas";

export const UploadDropzone = () => {
    const i18n = useIntl();
    const validationSchemas = useValidationSchemas();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<Map<string, File>>(new Map());
    const [fileErrors, setFileErrors] = useState<Record<string, string | null>>(
        Object.fromEntries(Object.keys(validationSchemas).map(filename => [filename, null]))  // Initialize from the keys from validationSchemas
    );

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
            // Add to previous files
            addFiles(validFiles)
            // Error handling
            errors.forEach(error => {
                // Remove existing file (even if the previous was correct already) -allows to reupload (despite incorrect)
                setFiles(prevFiles => new Map([...prevFiles].filter(([filename]) => filename !== error.message)));
                if(error instanceof CouldNotReadError) {
                    const formattedMessage = i18n.formatMessage({ id: "dropzone.upload.error.CouldNotReadError", defaultMessage: "Could not be read" })
                    setFileErrors(prevErrors => ({...prevErrors, [error.message]: formattedMessage}));
                }
                if(error instanceof EmptyFileError) {
                    const formattedMessage = i18n.formatMessage({ id: "dropzone.upload.error.EmptyFileError", defaultMessage: "Looks empty" })
                    setFileErrors(prevErrors => ({...prevErrors, [error.message]: formattedMessage}));
                }
                if(error instanceof MissingColumnsError) {
                    const formattedMessage = i18n.formatMessage(
                        { id: "dropzone.upload.error.MissingColumnsError", defaultMessage: "Missing: {missingColumns}"},
                        { missingColumns: error.missingColumns.join(", ") }
                    );
                    setFileErrors(prevErrors => ({...prevErrors, [error.message]: formattedMessage}));
                }
                console.error(error);
            });
        });
    }

    const addFiles = (validFiles: File[]) => {
        // Adding valid files with deduplication based on the filename
        setFiles(prevFiles => {
            const newFiles = new Map(prevFiles);
            validFiles.forEach(f => {
                newFiles.set(f.name, f);
                // Clear any errors from previous uploads
                setFileErrors(prevErrors => {
                    const { [f.name]: _, ...newErrors } = prevErrors;
                    return newErrors;
                });
            });
            return newFiles;
        });
    };

    function getFileEmoji(filename: string) {
        return files.has(filename) && !fileErrors[filename] ? (
            <span >🎉</span>
        ) : fileErrors[filename] ? (
            <span className="needed-files-emoji" data-tooltip={fileErrors[filename]}>⚠️</span>
        ) : <></>  // don't display anything specifically
    }

    function enableSubmit(): boolean {
        return files.size === Object.keys(validationSchemas).length && Object.values(fileErrors).every(error => error === null);
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
            <Button primary disabled={!enableSubmit()} onClick={() => submitFiles()}>
                <FormattedMessage id="dropzone.button.submit" defaultMessage="Submit"/>
            </Button>
        </div>
    );
};