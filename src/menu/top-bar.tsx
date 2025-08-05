import {Dropdown, Icon, Menu} from "semantic-ui-react";
import {IndiInfo, JsonGedcomData} from "../topola";
import {useState} from "react";
import {Media} from "../utils/media-utils";
import {ContactForm, ContactMenu} from "./contact-form";
import {LanguageMenu} from "./language-menu";
import {ChartMenu} from "./chart-menu";
import {FileMenu} from "./file-menu";
import {SearchBar} from "./search-bar";


export enum ScreenSize {
    LARGE, SMALL
}

export interface Props {
    showingChart: boolean;
    eventHandlers: EventHandlers;
    data?: JsonGedcomData;
}

interface EventHandlers {
    onHome: () => void;
    onSelection: (indiInfo: IndiInfo) => void;
    onDownloadPdf: () => void;
    onDownloadPng: () => void;
    onDownloadSvg: () => void;
    onDownloadGedcom: () => void;
    onResetView: () => void;
    onI18nLanguage: (lang: string) => void
}

export function TopBar(props: Props) {
    const [contactModalOpen, setContactModalOpen] = useState(false);

    function desktopMenu() {
        return <Menu as={Media} greaterThanOrEqual="large" attached="top" color="blue" size="large">
            {/* OPEN */}
            {FileMenu(ScreenSize.LARGE, props)}
            {/* HOME | DOWNLOAD | RESET VIEW */}
            {ChartMenu(ScreenSize.LARGE, props)}
            {/* CONTACT | I18N LANGUAGE */}
            {!props.showingChart &&
                <>
                    <ContactMenu screenSize={ScreenSize.LARGE} onContactClick={() => setContactModalOpen(true)}/>
                    <ContactForm open={contactModalOpen} onClose={() => setContactModalOpen(false)}/>
                    {LanguageMenu(ScreenSize.LARGE, props)}
                </>
            }
            {/* SEARCH */}
            {props.showingChart &&
                <SearchBar data={props.data!} onSelection={props.eventHandlers.onSelection}{...props}/>
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
                    {FileMenu(ScreenSize.SMALL, props)}
                    {/* HOME | DOWNLOAD | RESET VIEW */}
                    {ChartMenu(ScreenSize.SMALL, props)}
                    {/* CONTACT */}
                    <ContactMenu screenSize={ScreenSize.SMALL} onContactClick={() => setContactModalOpen(true)}/>
                    <ContactForm open={contactModalOpen} onClose={() => setContactModalOpen(false)}/>
                    {/* I18N LANGUAGE */}
                    {LanguageMenu(ScreenSize.SMALL, props)}
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
