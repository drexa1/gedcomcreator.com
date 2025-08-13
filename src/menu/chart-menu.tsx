import queryString from "query-string";
import {Dropdown, Icon, Menu} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import {useState} from "react";
import {EventHandlers, ScreenSize} from "./top-bar";
import {useHistory, useLocation} from "react-router";
import {ViewMenu} from "./view-menu";


type ChartMenusProps = {
    screenSize: ScreenSize;
    showingChart: boolean;
    eventHandlers: EventHandlers;
};

export function ChartMenu({ screenSize, showingChart, eventHandlers } : ChartMenusProps) {
    const history = useHistory();
    const location = useLocation();
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

    switch (screenSize) {
        case ScreenSize.LARGE:
            return (
                <>
                    <Menu className="chart-menu">
                        {/* HOME */}
                        <Menu.Item onClick={eventHandlers.onHome}>
                            <Icon name="home"/>
                            <FormattedMessage id="menu.home" defaultMessage="Home"/>
                        </Menu.Item>
                        {/* DOWNLOAD */}
                        <Dropdown className="item" trigger={
                            <div>
                                <Icon name="download"/>
                                <FormattedMessage id="menu.download" defaultMessage="Download"/>
                            </div>
                        }>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={eventHandlers.onDownloadPng}>
                                    <FormattedMessage id="menu.download_png" defaultMessage="Download PNG"/>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={eventHandlers.onDownloadSvg}>
                                    <FormattedMessage id="menu.download_svg" defaultMessage="Download SVG"/>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={eventHandlers.onDownloadPdf}>
                                    <FormattedMessage id="menu.download_pdf" defaultMessage="Download PDF"/>
                                </Dropdown.Item>
                                <Dropdown.Divider/>
                                <Dropdown.Item onClick={eventHandlers.onDownloadGedcom}>
                                    <FormattedMessage id="menu.download_gedcom" defaultMessage="Download GEDCOM"/>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        {/* VIEW (deprecated) */}
                        <Dropdown className="item hidden" trigger={
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
                            }>
                            <Dropdown.Menu>
                                <ViewMenu currentView={currentView} changeView={changeView}/>
                            </Dropdown.Menu>
                        </Dropdown>
                        {/* RESET VIEW */}
                        <Menu.Item onClick={eventHandlers.onResetView}>
                            <Icon name="target" />
                            <FormattedMessage id="menu.view.reset" defaultMessage="Reset view" />
                        </Menu.Item>
                    </Menu>
                </>
            );
        case ScreenSize.SMALL:
            if (!showingChart) {
                return (
                    <>
                        {/*<UrlMenu menuType={MenuType.Dropdown} {...props} />*/}
                    </>
                );
            } else {
                return (
                    <>
                        {/* DOWNLOAD */}
                        <Dropdown.Divider/>
                        <Dropdown.Item onClick={eventHandlers.onDownloadPdf}>
                            <Icon name="download"/>
                            <FormattedMessage id="menu.download_pdf" defaultMessage="Download PDF"/>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={eventHandlers.onDownloadPng}>
                            <Icon name="download"/>
                            <FormattedMessage id="menu.download_png" defaultMessage="Download PNG"/>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={eventHandlers.onDownloadSvg}>
                            <Icon name="download"/>
                            <FormattedMessage id="menu.download_svg" defaultMessage="Download SVG"/>
                        </Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item onClick={eventHandlers.onDownloadGedcom}>
                            <FormattedMessage id="menu.download_gedcom" defaultMessage="Download GEDCOM"/>
                        </Dropdown.Item>
                        <Dropdown.Divider/>
                        <Menu.Item onClick={eventHandlers.onResetView}>
                            <Icon name="eye" />
                            <FormattedMessage id="menu.view.reset" defaultMessage="Reset view"/>
                        </Menu.Item>
                    </>
                );
            }
    }
}