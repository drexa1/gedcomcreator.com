import {ScreenSize} from "./top-bar";
import {Icon, Menu} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import React from "react";


type HowitworksMenuProps = {
    screenSize: ScreenSize;
    onHowItWorksClick: () => void;
};

export function HowItWorksMenu({ screenSize, onHowItWorksClick }: HowitworksMenuProps) {
    switch (screenSize) {
        case ScreenSize.LARGE:
            return (
                <Menu.Item onClick={onHowItWorksClick}>
                    <Icon name="question circle"/><FormattedMessage id="menu.howitworks" defaultMessage="How it works"/>
                </Menu.Item>
            );
        case ScreenSize.SMALL:
            return (
                <>
                    {/* TODO: review */}
                </>
            );
    }
}