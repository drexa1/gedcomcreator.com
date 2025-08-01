import queryString from "query-string";
import {Dropdown, Icon, Menu} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import {IndiInfo, JsonGedcomData} from "../topola";
import {useRef, useState} from "react";
import {ConvertCSVMenu} from "./convert-menu";
import {Media} from "../util/media-utils";
import {MenuType} from "./menu-item";
import {SearchBar} from "./search";
import {UploadMenu} from "./upload-menu";
import {UrlMenu} from "./url-menu";
import {useHistory, useLocation} from "react-router";

enum ScreenSize {
    LARGE,
    SMALL,
}

interface Props {
    showingChart: boolean;
    data?: JsonGedcomData;
    eventHandlers: EventHandlers;
}

interface ViewMenusProps {
    currentView: string;
    changeView: (view: string) => void;
}

interface EventHandlers {
    onSelection: (indiInfo: IndiInfo) => void;
    onDownloadPdf: () => void;
    onDownloadPng: () => void;
    onDownloadSvg: () => void;
    onDownloadGedcom: () => void;
    onResetView: () => void;
}

export function TopBar(props: Props) {
    const history = useHistory();
    const location = useLocation();

    function FileMenus(screenSize: ScreenSize) {
        const [menuOpen, setMenuOpen] = useState(false);
        const cooldown = useRef(false);

        // Debug handler
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
                                <Icon name="home"/>
                                <FormattedMessage id="menu.home" defaultMessage="Home"/>
                            </div>
                        }
                        className="item">
                        <Dropdown.Menu onClick={() => toggleMenu(false)}>
                            <UploadMenu menuType={MenuType.Dropdown} {...props} />
                            <UrlMenu menuType={MenuType.Dropdown} {...props} />
                            <ConvertCSVMenu menuType={MenuType.Dropdown} {...props} />
                        </Dropdown.Menu>
                    </Dropdown>
                );
            case ScreenSize.SMALL:
                return (
                    <>
                        <UploadMenu menuType={MenuType.Dropdown} {...props} />
                        <UrlMenu menuType={MenuType.Dropdown} {...props} />
                        {/*<ConvertCSVMenu menuType={MenuType.Dropdown} {...props} />*/}
                    </>
                );
        }
    }

    function ChartMenus(screenSize: ScreenSize) {
        const [currentView, setCurrentView] = useState("hourglass");
        const changeView = (view: string) => {
            setCurrentView(view);
            const search = queryString.parse(location.search);
            if (search.view !== view) {
                search.view = view;
                location.search = queryString.stringify(search);
                history.push(location);
            }
        };

        if (!props.showingChart)
            return null;

        switch (screenSize) {
            case ScreenSize.LARGE:
                return (
                    <>
                        <Dropdown
                            trigger={
                                <div>
                                    <Icon name="download"/>
                                    <FormattedMessage id="menu.download" defaultMessage="Download"/>
                                </div>
                            }
                            className="item">
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={props.eventHandlers.onDownloadPdf}>
                                    <FormattedMessage id="menu.download_pdf" defaultMessage="Download PDF"/>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={props.eventHandlers.onDownloadPng}>
                                    <FormattedMessage id="menu.download_png" defaultMessage="Download PNG"/>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={props.eventHandlers.onDownloadSvg}>
                                    <FormattedMessage id="menu.download_svg" defaultMessage="Download SVG"/>
                                </Dropdown.Item>
                                <Dropdown.Divider/>
                                <Dropdown.Item onClick={props.eventHandlers.onDownloadGedcom}>
                                    <FormattedMessage id="menu.download_gedcom" defaultMessage="Download GEDCOM"/>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown
                            trigger={
                                <div>
                                    {currentView === "hourglass" ? (
                                        <>
                                            <Icon name="hourglass"/>
                                            <FormattedMessage id="menu.hourglass" defaultMessage="Hourglass"/>
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="users"/>
                                            <FormattedMessage id="menu.relatives" defaultMessage="All relatives"/>
                                        </>
                                    )}
                                </div>
                            }
                            className="item"
                        >
                            <Dropdown.Menu>
                                <ViewMenus currentView={currentView} changeView={changeView} />
                            </Dropdown.Menu>
                        </Dropdown>

                        <Menu.Item onClick={props.eventHandlers.onResetView}>
                            <Icon name="target" />
                            <FormattedMessage id="menu.view.reset" defaultMessage="Reset view" />
                        </Menu.Item>

                        <Menu.Menu position="right">
                            <SearchBar
                                data={props.data!}
                                onSelection={props.eventHandlers.onSelection}
                                {...props}
                            />
                        </Menu.Menu>
                    </>
                );
            case ScreenSize.SMALL:
                if (!props.showingChart) {
                    return (
                        <>
                            <UrlMenu menuType={MenuType.Dropdown} {...props} />
                        </>
                    );
                } else {
                    return (
                        <>
                            <Dropdown.Divider/>
                            <Dropdown.Item onClick={props.eventHandlers.onDownloadPdf}>
                                <Icon name="download"/>
                                <FormattedMessage id="menu.download_pdf" defaultMessage="Download PDF"/>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={props.eventHandlers.onDownloadPng}>
                                <Icon name="download"/>
                                <FormattedMessage id="menu.download_png" defaultMessage="Download PNG"/>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={props.eventHandlers.onDownloadSvg}>
                                <Icon name="download"/>
                                <FormattedMessage id="menu.download_svg" defaultMessage="Download SVG"/>
                            </Dropdown.Item>
                            <Dropdown.Divider/>
                            <Dropdown.Item onClick={props.eventHandlers.onDownloadGedcom}>
                                <FormattedMessage id="menu.download_gedcom" defaultMessage="Download GEDCOM"/>
                            </Dropdown.Item>
                            <Dropdown.Divider/>
                            <Menu.Item onClick={props.eventHandlers.onResetView}>
                                <Icon name="eye" />
                                <FormattedMessage id="menu.view.reset" defaultMessage="Reset view" />
                            </Menu.Item>
                        </>
                    );
                }
        }
    }

    function ViewMenus({ currentView, changeView }: ViewMenusProps) {
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

    return (
        <>
            {/* Desktop menus */}
            <Menu as={Media} greaterThanOrEqual="large" attached="top" color="blue" size="large">
                {
                    <>
                        {FileMenus(ScreenSize.LARGE)}
                        {ChartMenus(ScreenSize.LARGE)}
                    </>
                }
            </Menu>
            {/* Mobile menus */}
            <Menu as={Media} at="small" attached="top" color="blue" size="large">
                {
                    <>
                        <Dropdown
                            trigger={
                                <div>
                                    <Icon name="sidebar"/>
                                </div>
                            }
                            className="item"
                            icon={null}
                        >
                            <Dropdown.Menu>
                                {FileMenus(ScreenSize.SMALL)}
                                {ChartMenus(ScreenSize.SMALL)}
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                }
            </Menu>
        </>
    );
}
