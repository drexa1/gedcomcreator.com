import queryString from "query-string";
import {analyticsEvent} from "./utils/google-analytics";
import {DataSourceEnum, DataSourceSpec, SourceSelection} from "./datasource/data-source";
import {Details} from "./details/details";
import {EmbeddedDataSource, EmbeddedSourceSpec} from "./datasource/embedded";
import {FormattedMessage, useIntl} from "react-intl";
import {ErrorPopupProps, getI18nMessage} from "./utils/error-i18n";
import {IndiInfo} from "./topola";
import {Loader, Message, Portal, Tab} from "semantic-ui-react";
import {Media} from "./utils/media-utils";
import { Routes, Route, Navigate } from 'react-router-dom';
import {TopBar} from "./menu/top-bar";
import {
    getEthnicities,
    idToIndiMap,
    jsonToGedcom,
    loadLanguageOptions,
    startIndi,
    TopolaData
} from "./utils/gedcom-utils";
import {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router";
import {Chart, ChartType} from "./chart";
import {
    GedcomUrlDataSource,
    getSelection,
    UploadedDataSource,
    UploadSourceSpec,
    UrlSourceSpec
} from "./datasource/load-data";
import {IndividualLanguage} from "./model/individual";
import {configToArgs} from "./utils/config-utils";
import CSVLoader from "./datasource/load-csv";
import {getArguments} from "./utils/param-utils";
import {downloadGedcom, downloadPdf, downloadPng, downloadSvg, getFilename} from "./utils/chart-utils";
import {ConfigPanel, Config, DEFAULT_CONFIG, EthnicityArg, IdsArg, LanguagesArg, SexArg} from "./config";


enum AppState {
    INITIAL,
    LOADING,
    ERROR,
    SHOWING_CHART,
    LOADING_MORE
}

interface AppProps {
    setI18nLanguage: (lang: string) => void;
}

export function App(props: AppProps) {
    const onI18nLanguage = props.setI18nLanguage;

    const [state, setState] = useState<AppState>(AppState.INITIAL);
    const [data, setData] = useState<TopolaData>();
    const [selection, setSelection] = useState<IndiInfo>();
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sourceSpec, setSourceSpec] = useState<DataSourceSpec>();
    const [chartType, setChartType] = useState<ChartType>(ChartType.Hourglass);
    const [error, setError] = useState<string>();
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [gedcomString, setGedcomString] = useState<String>()
    const [freezeAnimation, setFreezeAnimation] = useState(false);
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [allLanguages, setAllLanguages] = useState<IndividualLanguage[]>([]);

    const location = useLocation();
    const navigate = useNavigate();
    const intl = useIntl();

    const uploadedDataSource = new UploadedDataSource();
    const gedcomUrlDataSource = new GedcomUrlDataSource();
    const embeddedDataSource = new EmbeddedDataSource();

    useEffect(() => {
        analyticsEvent("gedcomcreator_landing");
        loadLanguages().catch(e => console.error("Failed to load languages:", e));
        const rootElement = document.getElementById("root");
        if (location.pathname === "/") {
            rootElement?.classList.add("bgLogo");
        } else {
            rootElement?.classList.remove("bgLogo");
        }
        loadDataFromArgs().catch(e => console.error("Failed to load data:", e));
    });

    async function loadLanguages() {
        try {
            const allLanguages = await CSVLoader.loadLanguages("data/languages/languages.csv") || [];
            setAllLanguages(allLanguages);
        } catch (e) {
            console.error("Failed to load languages:", e);
        }
    }

    async function loadDataFromArgs() {
        if (location.pathname !== "/view") {
            if (state !== AppState.INITIAL)
                setState(AppState.INITIAL);
            return;
        }
        const args = getArguments(location, allLanguages);
        if (!args.sourceSpec) {
            navigate("/", { replace: true });
            return;
        }
        if (state === AppState.INITIAL || isNewData(args.sourceSpec, args.selection)) {
            setState(AppState.LOADING);
            setSourceSpec(args.sourceSpec);
            setChartType(args.chartType);
            setFreezeAnimation(args.freezeAnimation);
            setConfig(args.config);
            try {
                const data = await loadData(args.sourceSpec, args.selection);
                setData(data);
                setGedcomString(jsonToGedcom(data.gedcom));
                setSelection(args.selection !== undefined ? args.selection : startIndi(data));
                toggleDetails(args.config, data, allLanguages);
                setShowSidePanel(args.showSidePanel);
                setState(AppState.SHOWING_CHART);
            } catch (error: any) {
                setError(getI18nMessage(error, intl));
                setState(AppState.ERROR);
            }
        } else if (state === AppState.SHOWING_CHART || state === AppState.LOADING_MORE) {
            setChartType(args.chartType);
            setState(AppState.SHOWING_CHART);
            updateDisplay(args.selection !== undefined ? args.selection : startIndi(data));
        }
    }

    function isNewData(newSourceSpec: DataSourceSpec, newSelection?: IndiInfo) {
        if (!sourceSpec || sourceSpec.source !== newSourceSpec.source) {
            // New data source means new data
            return true;
        }
        const newSource = {spec: newSourceSpec, selection: newSelection};
        const oldSource = {
            spec: sourceSpec,
            selection: selection,
        };
        switch (newSource.spec.source) {
            case DataSourceEnum.UPLOADED:
                return uploadedDataSource.isNewData(
                    newSource as SourceSelection<UploadSourceSpec>,
                    oldSource as SourceSelection<UploadSourceSpec>,
                    data,
                );
            case DataSourceEnum.GEDCOM_URL:
                return gedcomUrlDataSource.isNewData(
                    newSource as SourceSelection<UrlSourceSpec>,
                    oldSource as SourceSelection<UrlSourceSpec>,
                    data,
                );
            case DataSourceEnum.EMBEDDED:
                return embeddedDataSource.isNewData(
                    newSource as SourceSelection<EmbeddedSourceSpec>,
                    oldSource as SourceSelection<EmbeddedSourceSpec>,
                    data,
                );
        }
    }

    function loadData(newSourceSpec: DataSourceSpec, newSelection?: IndiInfo, allLanguages?: IndividualLanguage[]) {
        switch (newSourceSpec.source) {
            case DataSourceEnum.UPLOADED:
                analyticsEvent("gedcomcreator_gedcom_upload");
                return uploadedDataSource.loadData({spec: newSourceSpec, selection: newSelection, allLanguages: allLanguages});
            case DataSourceEnum.GEDCOM_URL:
                analyticsEvent("gedcomcreator_url_load");
                return gedcomUrlDataSource.loadData({spec: newSourceSpec, selection: newSelection, allLanguages: allLanguages});
            case DataSourceEnum.EMBEDDED:
                return embeddedDataSource.loadData({spec: newSourceSpec, selection: newSelection, allLanguages: allLanguages});
        }
    }

    function toggleDetails(config: Config, data: TopolaData | undefined, allLanguages: IndividualLanguage[]) {
        if (data === undefined) return;
        // Set up if there are languages
        config.languageOptions = loadLanguageOptions(data, allLanguages)
        config.renderLanguagesOption = config.languageOptions.length > 0
        // Set up if there are ethnicities/tribes
        config.renderEthnicityOption = Array.from(getEthnicities(data)).length > 0
        idToIndiMap(data.chartData).forEach((indi) => {
            indi.hideLanguages = config.languages === LanguagesArg.HIDE;
            indi.hideEthnicity = config.ethnicity === EthnicityArg.HIDE;
            indi.hideId = config.id === IdsArg.HIDE;
            indi.hideSex = config.sex === SexArg.HIDE;
        });
    }

    /**
     * Sets the state with a new individual selection and chart type.
     */
    function updateDisplay(newSelection: IndiInfo) {
        if (!selection || selection.id !== newSelection.id || selection!.generation !== newSelection.generation) {
            setSelection(newSelection);
        }
    }

    function updateUrl(args: queryString.ParsedQuery<any>) {
        const search = queryString.parse(location.search);
        for (const key in args) {
            search[key] = args[key];
        }
        location.search = queryString.stringify(search);
        navigate(location);
    }

/* ------------------------------------------------------------------------------------------------------------------ */
/* EVENT HANDLERS                                                                                                     */
/* ------------------------------------------------------------------------------------------------------------------ */

    function onHome() {
        navigate("/");
    }

    /**
     * Called when the user clicks an individual box in the chart. Updates the browser URL.
     */
    function onSelection(selection: IndiInfo) {
        updateUrl({
            indi: selection.id,
            gen: selection.generation,
        });
    }

    async function onDownloadPdf() {
        try {
            analyticsEvent("gedcomcreator_download_pdf");
            const filename = getFilename(data?.gedcom)
            await downloadPdf(filename);
        } catch (e) {
            displayErrorPopup(
                intl.formatMessage({
                    id: "error.failed_pdf",
                    defaultMessage: "Failed to generate PDF file. Please try with a smaller diagram or download an SVG file.",
                })
            );
        }
    }

    async function onDownloadPng() {
        try {
            analyticsEvent("gedcomcreator_download_png");
            const filename = getFilename(data?.gedcom)
            await downloadPng(filename);
        } catch (e) {
            displayErrorPopup(
                intl.formatMessage({
                    id: "error.failed_png",
                    defaultMessage: "Failed to generate PNG file. Please try with a smaller diagram or download an SVG file."
                })
            );
        }
    }

    async function onDownloadSvg() {
        analyticsEvent("gedcomcreator_download_svg");
        const filename = getFilename(data?.gedcom)
        await downloadSvg(filename);
    }

    async function onDownloadGedcom() {
        analyticsEvent("gedcomcreator_download_gedcom");
        const filename = getFilename(data?.gedcom)
        await downloadGedcom(gedcomString as string, filename);
    }

    function onResetView() {
        const s = startIndi(data);
        const args = {
            indi: s.id,
            gen:  s.generation
        };
        const search = queryString.parse(location.search);
        for (const key in args) {
            delete search[key]
        }
        location.search = queryString.stringify(search);
        navigate(location);
    }

    function onDismissErrorPopup() {
        setShowErrorPopup(false);
    }

    function displayErrorPopup(message: string) {
        setShowErrorPopup(true);
        setError(message);
    }

/* ------------------------------------------------------------------------------------------------------------------ */

    /**
     * Shows an error message in the middle of the screen.
     */
    function ErrorMessage(props: { message?: string }) {
        return (
            <Message negative className="error">
                <Message.Header>
                    <FormattedMessage id="error.failed_to_load_file" defaultMessage={"Failed to load file"}/>
                </Message.Header>
                <p>{props.message}</p>
            </Message>
        );
    }

    /**
     * Shows a dismissable error message in the bottom left corner of the screen.
     */
    function ErrorPopup(props: ErrorPopupProps) {
        return (
            <Portal open={props.open} onClose={props.onDismiss}>
                <Message negative className="errorPopup" onDismiss={props.onDismiss}>
                    <Message.Header>
                        <FormattedMessage id="error.error" defaultMessage={"Error"}/>
                    </Message.Header>
                    <p>{props.message}</p>
                </Message>
            </Portal>
        );
    }

    function renderApp() {
        switch (state) {
            case AppState.SHOWING_CHART:
            case AppState.LOADING_MORE:
                const updatedSelection = getSelection(data!.chartData, selection);
                const sidePanelTabs = [
                    {
                        key: "info",
                        menuItem: { icon: "info circle", content: intl.formatMessage({ id: "tab.info", defaultMessage: "Info" }) },
                        render: () => <Details gedcom={data!.gedcom} indi={updatedSelection.id} />
                    },
                    {
                        key: "settings",
                        menuItem: { icon: "setting", content: intl.formatMessage({ id: "tab.settings", defaultMessage: "Settings" }) },
                        render: () => (
                            <ConfigPanel config={config} onChange={(config) => {
                                setConfig(config);
                                toggleDetails(config, data, allLanguages);
                                updateUrl(configToArgs(config));
                            }}/>
                        )
                    }
                ];
                return (
                    <div id="content">
                        <ErrorPopup open={showErrorPopup} message={error} onDismiss={onDismissErrorPopup}/>
                        {state === AppState.LOADING_MORE ? (<Loader active size="small" className="loading-more"/>) : null}
                        <Chart
                            data={data!.chartData}
                            selection={updatedSelection}
                            chartType={chartType}
                            freezeAnimation={freezeAnimation}
                            colors={config.color}
                            selectedLanguage={config.selectedLanguage}
                            hideLanguages={config.languages}
                            hideEthnicity={config.ethnicity}
                            hideIds={config.id}
                            hideSex={config.sex}
                            onSelection={onSelection}
                            languageOptions={config.languageOptions}
                        />
                        {showSidePanel ? (
                            <Media greaterThanOrEqual="large" className="sidePanel">
                                <Tab panes={sidePanelTabs}/>
                            </Media>
                        ) : null}
                    </div>
                );
            case AppState.ERROR: return <ErrorMessage message={error!}/>;
            case AppState.INITIAL:
            case AppState.LOADING: return <Loader active size="large"/>;
        }
    }

    return (
        <>
            <TopBar
                data={data?.chartData}
                showingChart={location.pathname === "/view" && (state === AppState.SHOWING_CHART || state === AppState.LOADING_MORE)}
                eventHandlers={{onHome, onI18nLanguage, onSelection, onDownloadPdf, onDownloadPng, onDownloadSvg, onDownloadGedcom, onResetView}}
            />
            <Routes>
                {/* <Route path="/create" element={<Creator/>} /> */}
                <Route path="/view" element={renderApp()}/>
                {/* <Route path="/privacy" element={<Privacy/>} /> */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
