import {GedcomEntry} from "parse-gedcom";
import {dereference, GedcomData, getData, getFileName, getImageFileEntry} from "./gedcom-utils";
import {DateOrRange, getDate} from "../topola";
import flatMap from "array.prototype.flatmap";


const FAMILY_EVENT_TAGS = ["MARR", "MARS", "DIV"];

export interface EventData {
    type: string;
    date?: DateOrRange;
    personLink?: GedcomEntry;
    place?: string[];
    images?: Image[];
    notes?: string[][];
    sources?: Source[];
    indi: string;
}

export interface Image {
    url: string;
    filename: string;
    title?: string;
}

export interface Source {
    title?: string;
    author?: string;
    page?: string;
    date?: DateOrRange;
    publicationInfo?: string;
}

export function getSpouse(indi: string, familyEntry: GedcomEntry, gedcom: GedcomData) {
    const spouseReference = familyEntry.tree
        .filter((familySubEntry) => ["WIFE", "HUSB"].includes(familySubEntry.tag))
        .find((familySubEntry) => !familySubEntry.data.includes(indi));
    if (!spouseReference) {
        return undefined;
    }
    return dereference(spouseReference, gedcom, (gedcom) => gedcom.indis);
}

export function eventPlace(entry: GedcomEntry) {
    const place = entry.tree.find((subEntry) => subEntry.tag === "PLAC");
    return place?.data ? getData(place) : undefined;
}

export function eventImages(entry: GedcomEntry, gedcom: GedcomData): Image[] {
    return entry.tree
        .filter((subEntry) => "OBJE" === subEntry.tag)
        .map((objectEntry) =>
            dereference(objectEntry, gedcom, (gedcom) => gedcom.other),
        )
        .map((objectEntry) => getImageFileEntry(objectEntry))
        .flatMap((imageFileEntry) =>
            imageFileEntry ? [
                {
                    url: imageFileEntry?.data || '',
                    filename: getFileName(imageFileEntry) || '',
                },
            ] : [],
        );
}

export function eventSources(entry: GedcomEntry, gedcom: GedcomData): Source[] {
    return entry.tree
        .filter((subEntry) => "SOUR" === subEntry.tag)
        .map((sourceEntryReference) => {
            const sourceEntry = dereference(sourceEntryReference, gedcom, (gedcom) => gedcom.other);
            const title = sourceEntry.tree.find((subEntry) => "TITL" === subEntry.tag);
            const abbr = sourceEntry.tree.find((subEntry) => "ABBR" === subEntry.tag);
            const author = sourceEntry.tree.find((subEntry) => "AUTH" === subEntry.tag);
            const publicationInfo = sourceEntry.tree.find((subEntry) => "PUBL" === subEntry.tag);
            const page = sourceEntryReference.tree.find((subEntry) => "PAGE" === subEntry.tag);
            const sourceData = sourceEntryReference.tree.find((subEntry) => "DATA" === subEntry.tag);
            const date = sourceData ? resolveDate(sourceData) : undefined;
            return {
                title: title?.data || abbr?.data,
                author: author?.data,
                page: page?.data,
                date: date ? getDate(date.data) : undefined,
                publicationInfo: publicationInfo?.data,
            };
        });
}

export function eventNotes(entry: GedcomEntry, gedcom: GedcomData): string[][] {
    return entry.tree
        .filter((subentry) => ["NOTE", "TYPE"].includes(subentry.tag))
        .map((note) => dereference(note, gedcom, (gedcom) => gedcom.other))
        .map((note) => getData(note));
}

export function toEvent(
    entry: GedcomEntry,
    gedcom: GedcomData,
    indi: string,
): EventData[] {
    return entry.tag === "FAMS" ? toFamilyEvents(entry, gedcom, indi) : toIndiEvent(entry, gedcom, indi);
}

function toIndiEvent(
    entry: GedcomEntry,
    gedcom: GedcomData,
    indi: string,
): EventData[] {
    const date = resolveDate(entry) || null;
    return [
        {
            date: date ? getDate(date.data) : undefined,
            type: entry.tag,
            place: eventPlace(entry),
            images: eventImages(entry, gedcom),
            notes: eventNotes(entry, gedcom),
            sources: eventSources(entry, gedcom),
            indi: indi,
        },
    ];
}

export function resolveDate(entry: GedcomEntry) {
    return entry.tree.find((subEntry) => subEntry.tag === "DATE");
}

export function toFamilyEvents(
    entry: GedcomEntry,
    gedcom: GedcomData,
    indi: string,
): EventData[] {
    const family = dereference(entry, gedcom, (gedcom) => gedcom.fams);
    return flatMap(FAMILY_EVENT_TAGS, (tag) =>
        family.tree.filter((entry) => entry.tag === tag),
    ).map((familyMarriageEvent) => {
        const date = resolveDate(familyMarriageEvent) || null;
        return {
            date: date ? getDate(date.data) : undefined,
            type: familyMarriageEvent.tag,
            personLink: getSpouse(indi, family, gedcom),
            place: eventPlace(familyMarriageEvent),
            images: eventImages(familyMarriageEvent, gedcom),
            notes: eventNotes(familyMarriageEvent, gedcom),
            sources: eventSources(familyMarriageEvent, gedcom),
            indi: indi,
        };
    });
}