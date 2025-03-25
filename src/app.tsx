import React, {ReactNode, useRef, useState} from 'react';
import {Header, Icon, Message} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import {InstructionsSection} from "./instructions-section";
import {UploadDropzone} from "./upload-dropzone";

export interface MessageState {
    type: "positive" | "negative";
    header: ReactNode;
    text: ReactNode;
}

export const App = () => {
    const [message, setMessage] = useState<MessageState | null>(null);
    const [messageVisible, setMessageVisible] = useState(false);

    const instructionsRef = useRef<{ open: () => void }>(null);

    // Function to show and fade out the message
    const showMessage = (msg: MessageState) => {
        setMessage(msg);
        setMessageVisible(true);
    };

    return (
        <div className="body">

            {/* MESSAGES SECTION ----------------------------------------------------------------------------------- */}
            {message && (
                <div className={`message-container ${messageVisible ? "expanded" : "collapsed"}`}>
                    <Message
                        info
                        positive={message.type === "positive"}
                        negative={message.type === "negative"}
                        onDismiss={() => setMessage(null)}>
                            <Message.Header>{message.header}</Message.Header>
                            <p>{message.text}</p>
                    </Message>
                </div>
            )}

            {/* HEADER SECTION ------------------------------------------------------------------------------------- */}
            <Header as="h1">
                <FormattedMessage id="header.h1" defaultMessage="Digitalize all your genealogy records into a family file"/>
            </Header>
            <p>
                <FormattedMessage id="header.p" defaultMessage="It is (and will always be) free up to 50 relatives. Above 50 relatives, $0.5 per relative"/>&nbsp;
                <Icon name="credit card"/>
            </p>

            {/* INSTRUCTIONS SECTION ------------------------------------------------------------------------------- */}
            <InstructionsSection showMessage={showMessage} instructionsRef={instructionsRef}/>

            {/* UPLOAD SECTION ------------------------------------------------------------------------------------- */}
            <UploadDropzone/>

        </div>
    );
}
