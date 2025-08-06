import {ScreenSize} from "./top-bar";
import {Icon, Menu} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import React from "react";


type ContactMenusProps = {
    screenSize: ScreenSize;
    onContactClick: () => void;
};

export function ContactMenu({ screenSize, onContactClick }: ContactMenusProps) {
    switch (screenSize) {
        case ScreenSize.LARGE:
            return (
                <Menu.Item onClick={onContactClick}>
                    <Icon name="mail"/><FormattedMessage id="menu.contact" defaultMessage="Contact"/>
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