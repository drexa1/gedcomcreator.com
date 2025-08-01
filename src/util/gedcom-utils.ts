import {GedcomEntry, parse as parseGedcom} from "parse-gedcom";
import {I18nError} from "./error-i18n";
import {gedcomEntriesToJson, JsonFam, JsonGedcomData, JsonImage, JsonIndi} from "../topola";
import {compareDates} from "./date-utils";
import {Language} from "../model/language";

export interface GedcomData {
    head: GedcomEntry;
    indis: { [key: string]: GedcomEntry };
    fams: { [key: string]: GedcomEntry };
    other: { [key: string]: GedcomEntry };
}

export interface TopolaData {
    chartData: JsonGedcomData;
    gedcom: GedcomData;
}

export interface GedcomTreeItem {
    tag: string;
    data: string;
}

export function startIndi(data: TopolaData | undefined) {
    const egoGen = getEgoGen(data)
    return {
        id: getLowestId(data) || "I0",  // lowest ID on the chart, focus at the root, not at the EGO
        generation: egoGen !== undefined ? -parseInt(egoGen, 10) : 0
    };
}

export function getEgoGen(data: TopolaData | undefined) {
    return getEgoRecord(data?.gedcom)
        .map(([_, value]) => value.tree.find(sub => sub.tag === "GEN")?.data)
        .find(data => data !== undefined);
}

export function getEgoRecord(gedcom: GedcomData | undefined) {
    return Object.entries(gedcom?.other || {}).filter(([_, value]) => value.tag === "EGO")
}

export function getLowestId(data: TopolaData | undefined) {
    return data?.chartData?.indis?.reduce((lowest, current) =>
            current.id.startsWith("I") && parseInt(current.id.slice(1), 10) < parseInt(lowest.id.slice(1), 10)
                ? current
                : lowest,
        data?.chartData?.indis?.[0]
    )?.id;
}

export function getGedcomLanguages(data: TopolaData | undefined) {
    return Object.entries(data?.gedcom?.indis || {})
        .reduce<Set<string>>((acc, [_, value]) => {
            const langDataArray = value.tree.filter((sub: any) => sub.tag === "LANG");
            langDataArray.forEach(lang => {
                if (lang.data) acc.add(lang.data);
            });
            return acc;
        }, new Set<string>());
}

export function loadLanguageOptions(data: TopolaData | undefined, allLanguages: Language[]) {
    const gedcomLanguages = Array.from(getGedcomLanguages(data));
    return allLanguages.filter((l: Language) => gedcomLanguages.includes(l.name)).sort();
}

export function getEthnicities(data: TopolaData | undefined) {
    return Object.entries(data?.gedcom?.indis || {})
        .reduce<Set<string>>((acc, [_, value]) => {
            const langDataArray = value.tree.filter((sub: any) => sub.tag === "_ETHN");
            langDataArray.forEach(lang => {
                if (lang.data) acc.add(lang.data);
            });
            return acc;
        }, new Set<string>());
}

/**
 * Returns the identifier extracted from a pointer string.
 * E.g. '@I123@' -> 'I123'
 */
export function pointerToId(pointer: string): string {
    return pointer.substring(1, pointer.length - 1);
}

export function idToIndiMap(data: JsonGedcomData): Map<string, JsonIndi> {
    const map = new Map<string, JsonIndi>();
    data.indis.forEach((indi) => {
        map.set(indi.id, indi);
    });
    return map;
}

export function idToFamMap(data: JsonGedcomData): Map<string, JsonFam> {
    const map = new Map<string, JsonFam>();
    data.fams.forEach((fam) => {
        map.set(fam.id, fam);
    });
    return map;
}

function prepareGedcom(entries: GedcomEntry[]): GedcomData {
    const head = entries.find((entry) => entry.tag === "HEAD")!;
    const indis: { [key: string]: GedcomEntry } = {};
    const fams: { [key: string]: GedcomEntry } = {};
    const other: { [key: string]: GedcomEntry } = {};
    entries.forEach((entry) => {
        if (entry.tag === "INDI") {
            indis[pointerToId(entry.pointer)] = entry;
        } else if (entry.tag === "FAM") {
            fams[pointerToId(entry.pointer)] = entry;
        } else if (entry.pointer) {
            other[pointerToId(entry.pointer)] = entry;
        }
    });
    return {head, indis, fams, other};
}

function strcmp(a: string, b: string) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

/** Birthdate comparator for individuals. */
function birthDatesComparator(gedcom: JsonGedcomData) {
    const indiMap = idToIndiMap(gedcom);
    return (indiId1: string, indiId2: string) => {
        const indi1: JsonIndi | undefined = indiMap.get(indiId1);
        const indi2: JsonIndi | undefined = indiMap.get(indiId2);
        return (
            compareDates(indi1 && indi1.birth, indi2 && indi2.birth) ||
            strcmp(indiId1, indiId2)
        );
    };
}

/** Marriage date comparator for families. */
function marriageDatesComparator(gedcom: JsonGedcomData) {
    const famMap = idToFamMap(gedcom);
    return (famId1: string, famId2: string) => {
        const fam1: JsonFam | undefined = famMap.get(famId1);
        const fam2: JsonFam | undefined = famMap.get(famId2);
        return (
            compareDates(fam1 && fam1.marriage, fam2 && fam2.marriage) ||
            strcmp(famId1, famId2)
        );
    };
}

/**
 * Sorts children by birthdate in the given family. Does not modify the input objects.
 */
function sortFamilyChildren(
    fam: JsonFam,
    comparator: (id1: string, id2: string) => number,
): JsonFam {
    if (!fam.children) {
        return fam;
    }
    const newChildren = fam.children.sort(comparator);
    return Object.assign({}, fam, {children: newChildren});
}

/**
 * Sorts children by birthdate. Does not modify the input object.
 */
function sortChildren(gedcom: JsonGedcomData): JsonGedcomData {
    const comparator = birthDatesComparator(gedcom);
    const newFams = gedcom.fams.map((fam) => sortFamilyChildren(fam, comparator));
    return Object.assign({}, gedcom, {fams: newFams});
}

/**
 * Sorts spouses by marriage date. Does not modify the input objects.
 */
function sortIndiSpouses(
    indi: JsonIndi,
    comparator: (id1: string, id2: string) => number,
): JsonFam {
    if (!indi.fams) {
        return indi;
    }
    const newFams = indi.fams.sort(comparator);
    return Object.assign({}, indi, {fams: newFams});
}

function sortSpouses(gedcom: JsonGedcomData): JsonGedcomData {
    const comparator = marriageDatesComparator(gedcom);
    const newIndis = gedcom.indis.map((indi) =>
        sortIndiSpouses(indi, comparator),
    );
    return Object.assign({}, gedcom, {indis: newIndis});
}

/**
 * If the entry is a reference to a top-level entry, the referenced entry is returned.
 * Otherwise, returns the given entry unmodified.
 */
export function dereference(
    entry: GedcomEntry,
    gedcom: GedcomData,
    getterFunction: (gedcom: GedcomData) => { [key: string]: GedcomEntry },
) {
    if (entry.data) {
        const dereferenced = getterFunction(gedcom)[pointerToId(entry.data)];
        if (dereferenced) {
            return dereferenced;
        }
    }
    return entry;
}

/**
 * Returns the data for the given GEDCOM entry as an array of lines.
 * Supports continuations with CONT and CONC.
 */
export function getData(entry: GedcomEntry) {
    const result = [entry.data];
    entry.tree.forEach((subentry) => {
        if (subentry.tag === "CONC" && subentry.data) {
            const last = result.length - 1;
            result[last] += subentry.data;
        } else if (subentry.tag === "CONT" && subentry.data) {
            result.push(subentry.data);
        }
    });
    return result;
}

/** Sorts children and spouses. */
export function normalizeGedcom(gedcom: JsonGedcomData): JsonGedcomData {
    return sortSpouses(sortChildren(gedcom));
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

/** Returns true if the given file name has a known image extension. */
export function isImageFile(fileName: string): boolean {
    const lowerName = fileName.toLowerCase();
    return IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

/**
 * Removes images that are not HTTP links or do not have known image extensions. Does not modify the input object.
 */
function filterImage(indi: JsonIndi, images: Map<string, string>): JsonIndi {
    if (!indi.images || indi.images.length === 0) {
        return indi;
    }
    const newImages: JsonImage[] = [];
    indi.images.forEach((image) => {
        const filePath = image.url.replaceAll('\\', '/');
        const fileName = filePath.match(/[^/]*$/)![0];
        // If the image file has been loaded into memory, use it.
        if (images.has(filePath)) {
            newImages.push({url: images.get(filePath)!, title: image.title});
        } else if (images.has(fileName)) {
            newImages.push({url: images.get(fileName)!, title: image.title});
        } else if (image.url.startsWith("http") && isImageFile(image.url)) {
            newImages.push(image);
        }
    });
    return Object.assign({}, indi, {images: newImages});
}

/**
 * Removes images that are not HTTP links. Does not modify the input object.
 */
function filterImages(
    gedcom: JsonGedcomData,
    images: Map<string, string>,
): JsonGedcomData {
    const newIndis = gedcom.indis.map((indi) => filterImage(indi, images));
    return Object.assign({}, gedcom, {indis: newIndis});
}

/**
 * Converts GEDCOM file into JSON data performing additional transformations:
 * - sort children by birthdate
 * - remove images that are not HTTP links and aren't mapped in `images`.
 *
 * @param gedcom
 * @param images Map from file name to image URL. This is used to pass in uploaded images.
 * @param allLanguages
 */
export function convertGedcom(
    gedcom: string,
    allLanguages: Language[],
    images: Map<string, string>
): TopolaData {
    const entries = parseGedcom(gedcom, allLanguages);
    const json = gedcomEntriesToJson(entries, allLanguages);
    if (
        !json ||
        !json.indis ||
        !json.indis.length ||
        !json.fams ||
        !json.fams.length
    ) {
        throw new I18nError("GEDCOM_READ_FAILED", "Insufficient GEDCOM data");
    }
    return {
        chartData: filterImages(normalizeGedcom(json), images),
        gedcom: prepareGedcom(entries)
    };
}

export function getName(person: GedcomEntry): string | undefined {
    const names = person.tree.filter((subEntry) => subEntry.tag === "NAME");
    const notMarriedName = names.find(
        (subEntry) =>
            subEntry.tree.filter(
                (nameEntry) => nameEntry.tag === "TYPE" && nameEntry.data === "married",
            ).length === 0,
    );
    const name = notMarriedName || names[0];
    return name?.data.replace(/\//g, '');
}

export function getFileName(fileEntry: GedcomEntry): string | undefined {
    const fileTitle = fileEntry?.tree.find((entry) => entry.tag === "TITL")?.data;
    const fileExtension = fileEntry?.tree.find((entry) => entry.tag === "FORM")?.data;
    return fileTitle && fileExtension && fileTitle + "." + fileExtension;
}

export function getImageFileEntry(objectEntry: GedcomEntry): GedcomEntry | undefined {
    return objectEntry.tree.find(
        (entry) =>
            entry.tag === "FILE" &&
            entry.data.startsWith("http") &&
            isImageFile(entry.data),
    );
}

/**
 * Reverts a TopolaData object to a gedcom string.
 * This is needed to export to gedcom. The original string is not for given, it could have originally come via
 * file upload, but it could have come by other data sources (url, etc.)
 * @param gedcomData
 */
export function jsonToGedcom(gedcomData: GedcomData): string {
    let gedcom = "";

    function processNode(node: GedcomEntry, level: number): void {
        let line = `${level} `;
        if (node.pointer) line += `${node.pointer} `;
        line += `${node.tag}`;
        if (node.data) line += ` ${node.data}`;
        gedcom += line + "\n";
        if (node.tree && node.tree.length > 0) {
            node.tree.forEach(child => processNode(child, level + 1));
        }
    }

    processNode(gedcomData.head, 0);
    gedcom += "\n";
    Object.values(gedcomData.other).forEach(record => {
        if (record.tag === "SUBM") {
            processNode(record, 0);
            gedcom += "\n";
        }
        if (record.tag === "EGO") {
            processNode(record, 0);
            gedcom += "\n";
        }
    });
    Object.values(gedcomData.indis).forEach(indi => {
        processNode(indi, 0);
        gedcom += "\n";
    });
    Object.values(gedcomData.fams).forEach(fam => {
        processNode(fam, 0);
        gedcom += "\n";
    });
    Object.values(gedcomData.other).forEach(record => {
        if (record.tag !== "SUBM" && record.tag !== "EGO") {
            processNode(record, 0);
            gedcom += "\n";
        }
    });
    gedcom += "0 TRLR";
    return gedcom.trim();
}
