import * as React from "react";
import * as ReactDOM from "react-dom";
// import messages_de from "./translations/de.json";
// import messages_fr from "./translations/fr.json";
// import messages_it from "./translations/it.json";
import messages_es from "././i18n/es.json";
import messages_pl from "././i18n/pl.json";
import {App} from "./app";
import {detect} from "detect-browser";
import {BrowserRouter as Router} from "react-router-dom";
import {IntlProvider} from "react-intl";
import {MediaContextProvider, mediaStyles} from "./utils/media-utils";
import "semantic-ui-css/semantic.min.css";
import "./styles/index.css";


/**
 * Initial captions for the i18n selector.
 */
const supportedLanguages = {
    "i18n.language.de": "🇩🇪 Deutsch",
    "i18n.language.en": "🇬🇧 English",
    "i18n.language.es": "🇪🇸 Español",
    "i18n.language.fr": "🇫🇷 Français",
    "i18n.language.it": "🇮🇹 Italiano",
    "i18n.language.pl": "🇵🇱 Polski"
}
export const i18nMessages = {
    // de: messages_de,
    es: messages_es,
    // fr: messages_fr,
    // it: messages_it,
    pl: messages_pl,
    en: supportedLanguages
};
const defaultLang = navigator.language?.split(/[-_]/)[0];

function Root() {
    const [i18nLanguage, setI18nLanguage] = React.useState(defaultLang);
    return (
        <IntlProvider locale={i18nLanguage} messages={i18nMessages[i18nLanguage]}>
            <MediaContextProvider>
                <style>{mediaStyles}</style>
                <Router>
                    <App setI18nLanguage={setI18nLanguage}/>
                </Router>
            </MediaContextProvider>
        </IntlProvider>
    );
}

const browser = detect();
ReactDOM.render(
    browser?.name === "ie" ? (
        <p>GEDCOM Creator does not support Internet Explorer. Please try a modern browser.</p>
    ) : (
        <Root/>
    ),
    document.getElementById("root")
);
