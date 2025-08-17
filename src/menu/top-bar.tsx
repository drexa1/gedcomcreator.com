import {Dropdown, Icon, Menu} from "semantic-ui-react";
import {IndiInfo, JsonGedcomData} from "../topola";
import React, {useState} from "react";
import {Media} from "../utils/media-utils";
import {ContactForm} from "../contact";
import {I18nLanguageMenu} from "./i18n-language-menu";
import {ChartMenu} from "./chart-menu";
import {FileMenu} from "./file-menu";
import {SearchBar} from "./search-bar";
import {ContactMenu} from "./contact-menu";
import {FormattedMessage} from "react-intl";


export enum ScreenSize {
    LARGE, SMALL
}

export interface TopBarProps {
    showingChart: boolean;
    eventHandlers: EventHandlers;
    data?: JsonGedcomData;
}

export interface EventHandlers {
    onHome: () => void;
    onSelection: (indiInfo: IndiInfo) => void;
    onDownloadPdf: () => void;
    onDownloadPng: () => void;
    onDownloadSvg: () => void;
    onDownloadGedcom: () => void;
    onResetView: () => void;
    onI18nLanguage: (lang: string) => void
}

export function TopBar({ showingChart, eventHandlers, data }: TopBarProps) {
    // const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);

    function desktopMenu() {
        return <Menu as={Media} greaterThanOrEqual="large" attached="top" className="ui linkblue menu" size="large">
            {/* OPEN */}
            <FileMenu screenSize={ScreenSize.LARGE} showingChart={showingChart}/>
            {/* HOME | DOWNLOAD | RESET VIEW */}
            {showingChart &&
                <ChartMenu
                    screenSize={ScreenSize.LARGE}
                    showingChart={showingChart}
                    eventHandlers={eventHandlers}
                />
            }
            {/* HOW IT WORKS | CONTACT | I18N LANGUAGE */}
            {!showingChart &&
                <>
                    <ContactMenu screenSize={ScreenSize.LARGE} onContactClick={() => setContactModalOpen(true)}/>
                    <ContactForm open={contactModalOpen} onClose={() => setContactModalOpen(false)}/>
                    {/*<HowItWorksMenu screenSize={ScreenSize.LARGE} onHowItWorksClick={() => setHowItWorksModalOpen(true)}/>*/}
                    {/*<HowItWorks open={howItWorksModalOpen} onClose={() => setHowItWorksModalOpen(false)}/>*/}
                    <Menu.Item onClick={alert}>
                        <Icon name="shield"/><FormattedMessage id="menu.privacy" defaultMessage="Privacy policy"/>
                    </Menu.Item>
                </>
            }
            {/* SEARCH */}
            {showingChart &&
                <SearchBar data={data!} onSelection={eventHandlers.onSelection}/>
            }
            <I18nLanguageMenu screenSize={ScreenSize.LARGE} onI18nLanguage={eventHandlers.onI18nLanguage}/>
        </Menu>;
    }

    function mobileMenu() {
        return <Menu as={Media} at="small" attached="top" color="blue" size="large">
            <Dropdown className="item" trigger={
                <div>
                    <Icon name="sidebar"/>
                </div>
            }>
                <Dropdown.Menu>
                    {/* OPEN */}
                    <FileMenu screenSize={ScreenSize.LARGE} showingChart={showingChart}/>
                    {/* HOME | DOWNLOAD | RESET VIEW */}
                    <ChartMenu
                        screenSize={ScreenSize.LARGE}
                        showingChart={showingChart}
                        eventHandlers={eventHandlers}
                    />
                    {/* CONTACT */}
                    <ContactMenu screenSize={ScreenSize.SMALL} onContactClick={() => setContactModalOpen(true)}/>
                    <ContactForm open={contactModalOpen} onClose={() => setContactModalOpen(false)}/>
                    {/* I18N LANGUAGE */}
                    <I18nLanguageMenu screenSize={ScreenSize.SMALL} onI18nLanguage={eventHandlers.onI18nLanguage}/>
                </Dropdown.Menu>
            </Dropdown>
        </Menu>;
    }

    return (
        <>
            {desktopMenu()}
            {mobileMenu()}
        </>
    );
}
