import {Dropdown, Icon} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import {i18nMessages} from "../index";
import {ScreenSize} from "./top-bar";


type LanguageMenuProps = {
    screenSize: ScreenSize;
    onI18nLanguage: (lang: string) => void;
};

export function I18nLanguageMenu({ screenSize, onI18nLanguage }: LanguageMenuProps) {
    const i18nLanguages = Object.keys(i18nMessages).sort();

    const changeI18nLanguage = (i18nLanguage: string) => {
        onI18nLanguage(i18nLanguage);
    };

    switch (screenSize) {
        case ScreenSize.LARGE:
            return (
                <>
                    <Dropdown floating direction="left" className="item no-arrow i18n-menu" trigger={
                        <Icon className="i18n-icon" name="globe"/>
                    }>
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