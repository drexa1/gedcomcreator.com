import {Dropdown, Icon} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import {useState} from "react";
import {i18nMessages} from "../index";
import {ScreenSize, Props} from "./top-bar";


export function LanguageMenu(screenSize: ScreenSize, props: Props) {
    const [currentI18nLanguage, setCurrentI18nLanguage] = useState("en");
    const i18nLanguages = Object.keys(i18nMessages)
        .filter(lang => lang !== currentI18nLanguage)
        .sort();

    const changeI18nLanguage = (i18nLanguage: string) => {
        setCurrentI18nLanguage(i18nLanguage);
        props.eventHandlers.onChangeI18nLanguage(i18nLanguage);  // calls setI18nLanguage from App → Root
    };

    switch (screenSize) {
        case ScreenSize.LARGE:
            return (
                <>
                    <Dropdown
                        trigger={
                            <div>
                                <Icon name="language"/>
                                &nbsp;<FormattedMessage id={`i18n.language.${currentI18nLanguage}`} defaultMessage={currentI18nLanguage}/>
                            </div>
                        }
                        className="item no-arrow">
                        <Dropdown.Menu>
                            {i18nLanguages.map(lang => (
                                <Dropdown.Item key={lang} onClick={() => changeI18nLanguage(lang)}>
                                    <FormattedMessage id={`i18n.language.${lang}`} defaultMessage={lang}/>
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </>
            );
        case ScreenSize.SMALL:
            return (
                <>
                    {/* TODO: review */}
                </>
            );
    }
}