import {saveAs} from 'file-saver';
import {FormattedMessage, useIntl} from 'react-intl';
import language from "./index";
import {MessageState} from "./app";

export const downloadTemplates = ({ showMessage }: { showMessage: (msg: MessageState) => void; }) => {
    const templatesFileName = useIntl().formatMessage({ id: "templates.zip", defaultMessage: "templates.zip" });
    const templatesFilePath = `${process.env.PUBLIC_URL}/templates/${language}/${templatesFileName}`;
    fetch(templatesFilePath)
        .then((response) => response.blob())
        .then((blob) => {
            saveAs(blob, templatesFileName);
            showMessage({
                type: "positive",
                header: (
                    <FormattedMessage
                        id="instructions.templates.downloaded"
                        defaultMessage="Review your Downloads folder"/>
                ),
                text: (
                    <>
                        <FormattedMessage
                            id="instructions.templates.compressed"
                            defaultMessage="You will find the assets.templates in the compressed file:"/>&nbsp;
                        <span>{useIntl().formatMessage({ id: "individuals.csv", defaultMessage: "1-individuals.csv" })}</span>,&nbsp;
                        <span>{useIntl().formatMessage({ id: "parents.csv", defaultMessage: "2-parents.csv" })}</span>,&nbsp;
                        <span>{useIntl().formatMessage({ id: "relationships.csv", defaultMessage: "3-relationships.csv" })}</span>
                    </>
                )
            });
        })
        .catch((error) => console.error("Download failed:", error));
};
