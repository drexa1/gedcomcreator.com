import queryString from "query-string";
import {Dropdown, Icon, Menu} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import {useState} from "react";
import {MenuType} from "./menu-item";
import {SearchBar} from "./search-bar";
import {UrlMenu} from "./url-menu";
import {Props, ScreenSize} from "./top-bar";
import {useHistory, useLocation} from "react-router";
import {ViewMenu} from "./view-menu";


export function ChartMenu(screenSize: ScreenSize, props: Props) {
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

    if (!props.showingChart)
        return null;

    switch (screenSize) {
        case ScreenSize.LARGE:
            return (
                <>
                    {/* HOME */}
                    <Menu.Item onClick={props.eventHandlers.onHome}>
                        <Icon name="home"/>
                        <FormattedMessage id="menu.open" defaultMessage="Home"/>
                    </Menu.Item>
                    {/* DOWNLOAD */}
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
                    {/* VIEW */}
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
                    <Menu.Item onClick={props.eventHandlers.onResetView}>
                        <Icon name="target" />
                        <FormattedMessage id="menu.view.reset" defaultMessage="Reset view" />
                    </Menu.Item>
                    {/* SEARCH */}
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
                        {/* DOWNLOAD */}
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
                            <FormattedMessage id="menu.view.reset" defaultMessage="Reset view"/>
                        </Menu.Item>
                    </>
                );
            }
    }
}