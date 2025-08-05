import {Dropdown, Icon} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";


interface ViewMenusProps {
    currentView: string;
    changeView: (view: string) => void;
}

export function ViewMenu({ currentView, changeView }: ViewMenusProps) {
    return (
        <>
            {currentView !== "hourglass" && (
                <Dropdown.Item onClick={() => changeView("hourglass")}>
                    <Icon name="hourglass" />
                    <FormattedMessage id="menu.hourglass" defaultMessage="Hourglass"/>
                </Dropdown.Item>
            )}
            {currentView !== "relatives" && (
                <Dropdown.Item onClick={() => changeView("relatives")}>
                    <Icon name="users" />
                    <FormattedMessage id="menu.relatives" defaultMessage="All relatives"/>
                </Dropdown.Item>
            )}
        </>
    );
}