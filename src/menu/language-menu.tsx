import {Dropdown, Icon} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import {i18nMessages} from "../index";
import {ScreenSize, Props} from "./top-bar";


export function LanguageMenu(screenSize: ScreenSize, props: Props) {
    const i18nLanguages = Object.keys(i18nMessages).sort();

    const changeI18nLanguage = (i18nLanguage: string) => {
        props.eventHandlers.onI18nLanguage(i18nLanguage);
    };

    switch (screenSize) {
        case ScreenSize.LARGE:
            return (
                <>
                    <Dropdown className="item no-arrow" floating direction="left"
                        trigger={
                            <div>
                                <Icon name="language"/>
                            </div>
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