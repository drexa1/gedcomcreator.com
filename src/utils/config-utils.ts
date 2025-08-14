import {ParsedQuery} from "query-string";
import {Config, DEFAULT_CONFIG, EthnicityArg, IdsArg, LanguagesArg, SexArg} from "../config";
import {ChartColors} from "../topola";


const COLOR_ARG = new Map<string, ChartColors>([
    ["n", ChartColors.NO_COLOR],
    ["g", ChartColors.COLOR_BY_GENERATION],
    ["s", ChartColors.COLOR_BY_SEX],
    ["e", ChartColors.COLOR_BY_ETHNICITY],
    ["nl", ChartColors.COLOR_BY_NR_LANGUAGES],
    ["l", ChartColors.COLOR_BY_LANGUAGE],
]);
const COLOR_ARG_INVERSE = new Map<ChartColors, string>();
COLOR_ARG.forEach((v, k) => COLOR_ARG_INVERSE.set(v, k));

const LANGUAGES_ARG = new Map<string, LanguagesArg>([
    ["h", LanguagesArg.HIDE],
    ["s", LanguagesArg.SHOW],
]);
const LANGUAGES_ARG_INVERSE = new Map<LanguagesArg, string>();
LANGUAGES_ARG.forEach((v, k) => LANGUAGES_ARG_INVERSE.set(v, k));

const ETHNICITY_ARG = new Map<string, EthnicityArg>([
    ["h", EthnicityArg.HIDE],
    ["s", EthnicityArg.SHOW],
]);
const ETHNICITY_ARG_INVERSE = new Map<EthnicityArg, string>();
ETHNICITY_ARG.forEach((v, k) => ETHNICITY_ARG_INVERSE.set(v, k));

const ID_ARG = new Map<string, IdsArg>([
    ["h", IdsArg.HIDE],
    ["s", IdsArg.SHOW],
]);
const ID_ARG_INVERSE = new Map<IdsArg, string>();
ID_ARG.forEach((v, k) => ID_ARG_INVERSE.set(v, k));

const SEX_ARG = new Map<string, SexArg>([
    ["h", SexArg.HIDE],
    ["s", SexArg.SHOW],
]);
const SEX_ARG_INVERSE = new Map<SexArg, string>();
SEX_ARG.forEach((v, k) => SEX_ARG_INVERSE.set(v, k));

export function argsToConfig(args: ParsedQuery<any>): Config {
    const getParam = (name: string) => {
        return typeof args[name] === "string" || typeof args[name] === "number" ? args[name] : undefined;
    };
    return {
        color: COLOR_ARG.get(getParam("c") ?? "") ?? DEFAULT_CONFIG.color,
        languages: LANGUAGES_ARG.get(getParam("l") ?? "") ?? DEFAULT_CONFIG.languages,
        selectedLanguage: getParam("n") ?? DEFAULT_CONFIG.selectedLanguage,
        ethnicity: ETHNICITY_ARG.get(getParam("e") ?? "") ?? DEFAULT_CONFIG.ethnicity,
        id: ID_ARG.get(getParam("i") ?? "") ?? DEFAULT_CONFIG.id,
        sex: SEX_ARG.get(getParam("s") ?? "") ?? DEFAULT_CONFIG.sex,
        renderEthnicityOption: DEFAULT_CONFIG.renderEthnicityOption,
        renderLanguagesOption: DEFAULT_CONFIG.renderLanguagesOption,
        languageOptions: DEFAULT_CONFIG.languageOptions
    };
}

export function configToArgs(config: Config): ParsedQuery<any> {
    return {
        c: COLOR_ARG_INVERSE.get(config.color),
        l: LANGUAGES_ARG_INVERSE.get(config.languages),
        e: ETHNICITY_ARG_INVERSE.get(config.ethnicity),
        i: ID_ARG_INVERSE.get(config.id),
        s: SEX_ARG_INVERSE.get(config.sex),
        n: config.selectedLanguage
    };
}