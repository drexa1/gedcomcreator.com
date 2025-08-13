import {Modal} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import React from "react";

type HowItWorksProps = {
    open: boolean;
    onClose: () => void;
};

export function HowItWorks({ open, onClose }: HowItWorksProps) {

    return (
        <Modal /* closeIcon */ open={open} onClose={onClose} size="fullscreen" dimmer="inverted" transition={{ animation: "scale", duration: 1 }}>
            <Modal.Header style={{ marginTop: "30px" }}>
                <FormattedMessage id="howitworks.title" defaultMessage="How does this app work?"/>
            </Modal.Header>
            <Modal.Content>
                hi
            </Modal.Content>
        </Modal>
    );
}