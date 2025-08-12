import {Dropdown, Icon, Menu} from "semantic-ui-react";
import {IndiInfo, JsonGedcomData} from "../topola";
import React, {useState} from "react";
import {Media} from "../utils/media-utils";
import {ContactForm} from "../contact";
import {LanguageMenu} from "./language-menu";
import {ChartMenu} from "./chart-menu";
import {FileMenu} from "./file-menu";
import {SearchBar} from "./search-bar";
import {ContactMenu} from "./contact-menu";


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
    const [contactModalOpen, setContactModalOpen] = useState(false);

    function desktopMenu() {
        return <Menu as={Media} greaterThanOrEqual="large" attached="top" color="blue" size="large">
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
                    {/* TODO: HowItWorksMenu */}
                    <Menu.Item onClick={alert}>
                        <Icon name="question circle"/>How it works
                    </Menu.Item>
                    {/* TODO: PrivacyMenu */}
                    <Menu.Item onClick={alert}>
                        <Icon name="privacy"/>Privacy policy
                    </Menu.Item>
                    <ContactMenu screenSize={ScreenSize.LARGE} onContactClick={() => setContactModalOpen(true)}/>
                    <ContactForm open={contactModalOpen} onClose={() => setContactModalOpen(false)}/>
                    <LanguageMenu screenSize={ScreenSize.LARGE} onI18nLanguage={eventHandlers.onI18nLanguage}/>
                </>
            }
            {/* SEARCH */}
            {showingChart &&
                <SearchBar data={data!} onSelection={eventHandlers.onSelection}/>
            }
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
                    <LanguageMenu screenSize={ScreenSize.SMALL} onI18nLanguage={eventHandlers.onI18nLanguage}/>
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
