import {
    Menu,
    Dropdown,
    MenuItemProps,
    DropdownItemProps,
} from 'semantic-ui-react';

export enum MenuType {
    Menu,
    Dropdown
}

interface Props {
    menuType?: MenuType;
}

export function MenuItem(props: Props & MenuItemProps & DropdownItemProps) {
    const newProps = {...props};
    delete newProps.menuType;  // remove from props to avoid error in the console
    return (
        <>
            {props.menuType === MenuType.Menu? (
                <Menu.Item {...newProps}>{props.children}</Menu.Item>
            ) : (
                <Dropdown.Item {...newProps}>{props.children}</Dropdown.Item>
            )}
        </>
    );
}
