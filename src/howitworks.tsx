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
                {/* GEDCOM como estandar de digitalizacion */}

                {/* dificil aprender codigo gedcom */}
                {/* casi toda el mundo quiere verlo */}
                {/* i18n code and chart examples */}

                {/* story */}
                {/* investigaciones academicas (papers) */}
                {/* no habia herramientas o estaban desconectadas */}
                {/* based on Topola lib, tuvimos que vitaminarlo */}
                {/* enfasis en los ratos con la familia */}
                {/* el brillo en sus ojos */}
                {/* y para nosotros el rato que pasamos con ellos */}

                {/* how to fill excel */}
                {/* start by either YOU or ELDEST */}

                {/* si necesitas ayuda puedes contactar con nosotros, fees */}
                {/* idiomas soportados + traductor */}

                {/* Be patient, is like a puzzle */}
            </Modal.Content>
        </Modal>
    );
}