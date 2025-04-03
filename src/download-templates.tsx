import {saveAs} from 'file-saver';
import {FormattedMessage, useIntl} from 'react-intl';
import language from "./index";
import {MessageState} from "./app";

export const DownloadTemplates = ({ showMessage }: { showMessage: (msg: MessageState) => void; }) => {
    const { formatMessage } = useIntl();

    const templatesFileName = formatMessage({ id: "templates.zip", defaultMessage: "templates.zip" });
    const templatesFilePath = `${process.env.PUBLIC_URL}/templates/${language}/${templatesFileName}`;

    const individualsFilename = formatMessage({ id: "individuals.tsv", defaultMessage: "1-individuals.tsv" });
    const parentsFilename = formatMessage({ id: "parents.tsv", defaultMessage: "2-parents.tsv" });
    const relationshipsFilename = formatMessage({ id: "relationships.tsv", defaultMessage: "3-relationships.tsv" });

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
                        <span>{individualsFilename}</span>,&nbsp;
                        <span>{parentsFilename}</span>,&nbsp;
                        <span>{relationshipsFilename}</span>
                    </>
                )
            });
        })
        .catch((error) => console.error("Download failed:", error));
};
