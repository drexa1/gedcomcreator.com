import {Dropdown, Icon} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import {useRef, useState} from "react";
import {ConvertCSVMenu} from "./convert-menu";
import {MenuType} from "./menu-item";
import {UploadMenu} from "./upload-menu";
import {Props, ScreenSize} from "./top-bar";


export function FileMenu(screenSize: ScreenSize, props: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const cooldown = useRef(false);

    const toggleMenu = (state: boolean) => {
        if (!state) {
            cooldown.current = true;
            setMenuOpen(false);
            setTimeout(() => {
                cooldown.current = false;
            }, 150);
        } else if (!cooldown.current) {
            setMenuOpen(true);
        }
    };

    switch (screenSize) {
        case ScreenSize.LARGE:
            return (
                <Dropdown
                    onOpen={() => toggleMenu(true)}
                    onClose={() => toggleMenu(false)}
                    open={menuOpen}
                    trigger={
                        <div>
                            <Icon name="folder open"/>
                            <FormattedMessage id="menu.open" defaultMessage="Open"/>
                        </div>
                    }
                    className="item left">
                    <Dropdown.Menu onClick={() => toggleMenu(false)}>
                        <UploadMenu menuType={MenuType.Dropdown} {...props} />
                        {/*<UrlMenu menuType={MenuType.Dropdown} {...props} />*/}
                        <ConvertCSVMenu menuType={MenuType.Dropdown} {...props} />
                    </Dropdown.Menu>
                </Dropdown>
            );
        case ScreenSize.SMALL:
            return (
                <>
                    <UploadMenu menuType={MenuType.Dropdown} {...props} />
                    {/*<UrlMenu menuType={MenuType.Dropdown} {...props} />*/}
                    <ConvertCSVMenu menuType={MenuType.Dropdown} {...props} />
                </>
            );
    }
}