import React, {ChangeEvent, DragEvent, ReactElement, useRef, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {Button, Icon} from "semantic-ui-react";
import {uploadValidation} from "./upload-validate";
import {MessageState} from "./app";
import {useValidationSchemas} from "./upload-validate-schemas";

export const UploadDropzone = ({ showMessage }: { showMessage: (message: MessageState) => void }) => {
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const validationSchemas = useValidationSchemas();
    const i18n = useIntl();

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleUploadDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        await HandleFiles(event.dataTransfer.files);
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        await HandleFiles(event.target.files);
    };

    const HandleFiles = async (newFiles: FileList | null) => {
        try {
            if (newFiles) {
                const validFiles = uploadValidation(newFiles, files, validationSchemas);
                if (validFiles) {
                    setFiles([...files, ...validFiles]);  // add to previous
                }
            }
        } catch (e: any) {
            showMessage({
                type: "negative",
                header: (<FormattedMessage id={ e.literal } defaultMessage={ e.message } values={ e.details }/>),
                text: null
            });
        }
    };

    function getFileEmoji(filename: string) {
        if (files.some(file => file.name === filename)) {
            return "🎉"
        }
        return null;
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
                    <div className="upload-needed-files">
                        <p><FormattedMessage id="individuals.csv"   defaultMessage="1-individuals.csv"/></p>
                        <p><FormattedMessage id="parents.csv"       defaultMessage="2-parents.csv"/></p>
                        <p><FormattedMessage id="relationships.csv" defaultMessage="3-relationships.csv"/></p>
                    </div>
                    {/* Success/warning emojis */}
                    <div>
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