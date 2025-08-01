import * as queryString from "query-string";
import flatMap from "array.prototype.flatmap";
import {compareDates, formatDateOrRange} from "../util/date-utils";
import {
    dereference,
    GedcomData,
    getData,
    getFileName,
    getImageFileEntry,
    getName,
    pointerToId,
} from "../util/gedcom-utils";
import {GedcomEntry} from "parse-gedcom";
import {FormattedMessage, useIntl} from "react-intl";
import {Link, useLocation} from "react-router-dom";
import {TranslatedTag} from "./translated-tag";
import {Header, Item} from "semantic-ui-react";
import {EventExtras, Image, Source} from "./event-extras";
import {DateOrRange, getDate} from "../topola";

function PersonLink(props: { person: GedcomEntry }) {
    const location = useLocation();
    const name = getName(props.person);
    const search = queryString.parse(location.search);
    search["indi"] = pointerToId(props.person.pointer);
    return (
        <Item.Meta>
            <Link to={{pathname: "/view", search: queryString.stringify(search)}}>
                {name ? (name) : (<FormattedMessage id="name.unknown_name" defaultMessage="N.N."/>)}
            </Link>
        </Item.Meta>
    );
}

interface Props {
    gedcom: GedcomData;
    indi: string;
    entries: GedcomEntry[];
}

interface EventData {
    type: string;
    date?: DateOrRange;
    personLink?: GedcomEntry;
    place?: string[];
    images?: Image[];
    notes?: string[][];
    sources?: Source[];
    indi: string;
}

const EVENT_TAGS = ["BIRT", "BAPM", "CHR", "FAMS", "EVEN", "CENS", "DEAT", "BURI"];
const FAMILY_EVENT_TAGS = ["MARR", "MARS", "DIV"];

function EventHeader(props: { event: EventData }) {
    const intl = useIntl();
    return (
        <div className="event-header">
            <Header as="span" size="small">
                <TranslatedTag tag={props.event.type}/>
            </Header>
            {props.event.date ? (
                <Header as="span" textAlign="right" sub>
                    {formatDateOrRange(props.event.date, intl)}
                </Header>
            ) : null}
        </div>
    );
}

function getSpouse(indi: string, familyEntry: GedcomEntry, gedcom: GedcomData) {
    const spouseReference = familyEntry.tree
        .filter((familySubEntry) => ["WIFE", "HUSB"].includes(familySubEntry.tag))
        .find((familySubEntry) => !familySubEntry.data.includes(indi));
    if (!spouseReference) {
        return undefined;
    }
    return dereference(spouseReference, gedcom, (gedcom) => gedcom.indis);
}

function eventPlace(entry: GedcomEntry) {
    const place = entry.tree.find((subEntry) => subEntry.tag === "PLAC");
    return place?.data ? getData(place) : undefined;
}

function eventImages(entry: GedcomEntry, gedcom: GedcomData): Image[] {
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

function eventSources(entry: GedcomEntry, gedcom: GedcomData): Source[] {
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

function eventNotes(entry: GedcomEntry, gedcom: GedcomData): string[][] {
    return entry.tree
        .filter((subentry) => ["NOTE", "TYPE"].includes(subentry.tag))
        .map((note) => dereference(note, gedcom, (gedcom) => gedcom.other))
        .map((note) => getData(note));
}

function toEvent(
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

function resolveDate(entry: GedcomEntry) {
    return entry.tree.find((subEntry) => subEntry.tag === "DATE");
}

function toFamilyEvents(
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

function Event(props: { event: EventData }) {
    return (
        <Item>
            <Item.Content>
                <EventHeader event={props.event}/>
                {!!props.event.personLink && (<PersonLink person={props.event.personLink}/>)}
                {!!props.event.place && (<Item.Description>{props.event.place}</Item.Description>)}
                <EventExtras
                    images={props.event.images}
                    notes={props.event.notes}
                    sources={props.event.sources}
                    indi={props.event.indi}
                />
            </Item.Content>
        </Item>
    );
}

export function Events(props: Props) {
    const events = flatMap(EVENT_TAGS, (tag) =>
        props.entries
            .filter((entry) => entry.tag === tag)
            .map((eventEntry) => toEvent(eventEntry, props.gedcom, props.indi))
            .flatMap((events) => events)
            .sort((event1, event2) => compareDates(event1.date, event2.date)),
    );
    if (events.length) {
        return (
            <>
                {events.map((event, index) => (
                    <Event event={event} key={index}/>
                ))}
            </>
        );
    }
    return null;
}
