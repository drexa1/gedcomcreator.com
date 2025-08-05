import lunr, {PipelineFunction} from "lunr";
import {idToFamMap, idToIndiMap} from "./gedcom-utils";
import {JsonFam, JsonGedcomData, JsonIndi} from "../topola";
import {formatDateOrRange} from "./date-utils";
import {IntlShape} from "react-intl";
import naturalSort from "javascript-natural-sort";

require("lunr-languages/lunr.stemmer.support")(lunr);
require("lunr-languages/lunr.de")(lunr);
require("lunr-languages/lunr.fr")(lunr);
require("lunr-languages/lunr.it")(lunr);
require("lunr-languages/lunr.ru")(lunr);


const MAX_RESULTS = 8;

export interface SearchUtils {
    search(input: string): SearchResult[];
}

export interface SearchResult {
    id: string;
    indi: JsonIndi;
}

export function getDescriptionLine(indi: JsonIndi, intl: IntlShape) {
    const birthDate = formatDateOrRange(indi.birth, intl);
    const deathDate = formatDateOrRange(indi.death, intl);
    if (!deathDate) {
        return birthDate;
    }
    return `${birthDate} – ${deathDate}`;
}

/**
 * Removes accents from letters, e.g. ó->o, ę->e.
 */
function normalize(input: string) {
    return input
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u0142/g, "l"); // Special case: ł is not affected by NFD.
}

/**
 * Comparator to sort by score first, then by id.
 */
function compare(a: lunr.Index.Result, b: lunr.Index.Result) {
    if (a.score !== b.score) {
        return b.score - a.score;
    }
    return naturalSort(a.ref, b.ref);
}

/**
 * Returns all last names of all husbands as a space-separated string.
 */
function getHusbandLastName(
    indi: JsonIndi,
    indiMap: Map<String, JsonIndi>,
    famMap: Map<string, JsonFam>,
): string {
    return (indi.fams || [])
        .map((famId) => famMap.get(famId))
        .map((fam) => fam && fam.husb)
        .map((husbId) => husbId && indiMap.get(husbId))
        .map((husband) => husband && husband.lastName)
        .join(" ");
}

/**
 * Builds a search index from data.
 */
export function buildSearchIndex(data: JsonGedcomData): SearchUtils {
    const index = new LunrSearchIndex(data);
    index.initialize();
    return index;
}

class LunrSearchIndex implements SearchUtils {
    private index: lunr.Index | undefined;
    private indiMap: Map<string, JsonIndi>;
    private famMap: Map<string, JsonFam>;

    constructor(data: JsonGedcomData) {
        this.indiMap = idToIndiMap(data);
        this.famMap = idToFamMap(data);
    }

    initialize() {
        const self = this;
        this.index = lunr(function () {
            //Trimmer will break non-latin characters, so custom multilingual implementation must be used
            self.initMultiLingualLunrWithoutTrimmer(this, [
                "de",
                "en",
                "fr",
                "it",
                "ru",
            ]);
            this.ref("id");
            this.field("id");
            this.field("name", {boost: 10});
            this.field("normalizedName", {boost: 8});
            this.field("spouseLastName", {boost: 2});
            this.field("normalizedSpouseLastName", {boost: 2});

            self.indiMap.forEach((indi) => {
                const name = [indi.firstName, indi.lastName].join(" ");
                const spouseLastName = getHusbandLastName(
                    indi,
                    self.indiMap,
                    self.famMap,
                );
                this.add({
                    id: indi.id,
                    name,
                    normalizedName: normalize(name),
                    spouseLastName,
                    normalizedSpouseLastName: normalize(spouseLastName),
                });
            });
        });
    }

    private initMultiLingualLunrWithoutTrimmer(
        lunrInstance: any,
        languages: string[],
    ): void {
        const pipelineFunctions: PipelineFunction[] = [];
        const searchPipelineFunctions: PipelineFunction[] = [];
        languages.forEach((language) => {
            if (language === "en") {
                pipelineFunctions.unshift(lunr.stopWordFilter);
                pipelineFunctions.push(lunr.stemmer);
                searchPipelineFunctions.push(lunr.stemmer);
            } else {
                if (lunr[language].stopWordFilter) {
                    pipelineFunctions.unshift(lunr[language].stopWordFilter);
                }
                if (lunr[language].stemmer) {
                    pipelineFunctions.push(lunr[language].stemmer);
                    searchPipelineFunctions.push(lunr[language].stemmer);
                }
            }
        });
        lunrInstance.pipeline.reset();
        lunrInstance.pipeline.add.apply(lunrInstance.pipeline, pipelineFunctions);

        if (lunrInstance.searchPipeline) {
            lunrInstance.searchPipeline.reset();
            lunrInstance.searchPipeline.add.apply(
                lunrInstance.searchPipeline,
                searchPipelineFunctions,
            );
        }
    }

    public search(input: string): SearchResult[] {
        const query = input
            .split(" ")
            .filter((s) => !!s)
            .map((s) => `${s} ${s}*`)
            .join(" ");
        const results = this.index!.search(query);
        return results
            .sort(compare)
            .slice(0, MAX_RESULTS)
            .map((result) => ({id: result.ref, indi: this.indiMap.get(result.ref)!}));
    }
}
