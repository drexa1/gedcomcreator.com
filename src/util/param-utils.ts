import * as H from "history";
import {IndiInfo} from '../topola';
import * as queryString from "query-string";
import {Language} from "../model/language";
import {ChartType} from "../chart";
import {DataSourceEnum, DataSourceSpec} from "../datasource/data-source";
import {argsToConfig, Config} from "../config";


/**
 * Arguments passed to the application, primarily through URL parameters.
 */
interface Arguments {
    sourceSpec?: DataSourceSpec;
    selection?: IndiInfo;
    chartType: ChartType;
    freezeAnimation: boolean;
    showSidePanel: boolean;
    config: Config;
}

/**
 * Retrieve arguments passed into the application through the URL and uploaded data.
 */
export function getArguments(location: H.Location<any>, allLanguages: Language[]): Arguments {
    const search = queryString.parse(location.search);
    const getParam = (name: string) => getParamFromSearch(name, search);
    const view = getParam("view");
    const chartTypes = new Map<string | undefined, ChartType>([["relatives", ChartType.Relatives]]);
    const hash = getParam("file");
    const url = getParam("url");
    const embedded = getParam("embedded") === "true"; // False by default.
    let sourceSpec: DataSourceSpec | undefined = undefined;

    if (hash) {
        sourceSpec = {
            source: DataSourceEnum.UPLOADED,
            hash,
            gedcom: location.state && location.state.data,
            allLanguages: allLanguages,
            images: location.state && location.state.images,
        };
    } else if (url) {
        sourceSpec = {
            source: DataSourceEnum.GEDCOM_URL,
            url,
            allLanguages: allLanguages,
            handleCors: getParam("handleCors") !== "false", // True by default.
        };
    } else if (embedded) {
        sourceSpec = {source: DataSourceEnum.EMBEDDED};
    }

    const indi = getParam("indi");
    const parsedGen = Number(getParam("gen"));
    const selection = indi
        ? {id: indi, generation: !isNaN(parsedGen) ? parsedGen : 0}
        : undefined

    return {
        sourceSpec,
        selection,
        chartType: chartTypes.get(view) || ChartType.Hourglass,
        showSidePanel: getParam("sidePanel") !== "false", // True by default.
        freezeAnimation: getParam("freeze") === "true", // False by default
        config: argsToConfig(search),
    };
}

export function getParamFromSearch(name: string, search: queryString.ParsedQuery) {
    const value = search[name];
    return typeof value === "string" ? value : undefined;
}
