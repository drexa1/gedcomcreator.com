import flatMap from "array.prototype.flatmap";
import {dereference, GedcomData, getData, getFileName, getImageFileEntry} from "../utils/gedcom-utils";
import {Events} from "./events";
import {GedcomEntry} from "parse-gedcom";
import {MultilineText} from "./multiline-text";
import {TranslatedTag} from "./translated-tag";
import {Header, Item} from "semantic-ui-react";
import {FormattedMessage} from "react-intl";
import {WrappedImage} from "./wrapped-image";
import {ReactNode} from "react";


const EXCLUDED_TAGS = ["BIRT", "BAPM", "CHR", "EVEN", "CENS", "DEAT", "BURI", "NAME", "SEX", "FAMC", "FAMS", "NOTE", "SOUR", "LANG"];

interface DetailsProps {
    gedcom: GedcomData;
    indi: string;
}

function getDetails(entries: GedcomEntry[], tags: string[], detailsFunction: (entry: GedcomEntry) => ReactNode | null): ReactNode {
    return flatMap(tags, (tag) => entries
        .filter((entry) => entry.tag === tag)
        .map((entry) => detailsFunction(entry)))
        .filter((element) => element !== null)
        .map((element, index) => (
            <Item key={index}>
                <Item.Content className="details event-header header">{element}</Item.Content>
            </Item>
        ));
}

function nameDetails(entry: GedcomEntry) {
    const fullName = entry.data.replaceAll("/", "");
    const nameType = entry.tree.find((entry) => entry.tag === "TYPE" && entry.data !== "Unknown")?.data;

    return (
        <>
            <Header as="span" size="large">
                {fullName ? (fullName) : (
                    <FormattedMessage id="name.unknown_name" defaultMessage="N.N."/>
                )}
            </Header>
            {fullName && nameType && (
                <Item.Meta>
                    <TranslatedTag tag={nameType}/>
                </Item.Meta>
            )}
        </>
    );
}

function getMultilineDetails(entries: GedcomEntry[], tags: string[], title: [string, string]) {
    const lines= entries
        .filter((entry) => tags.includes(entry.tag))
        .filter(hasData)
        .map((element) => element.data)
    if (!lines.length)
        return null;

    return (
        <Item key="languages">
            <Item.Content>
                <Header as="span">
                    <FormattedMessage id={title[0]} defaultMessage={title[1]}/>
                </Header>
                <span>
                    <MultilineText lines={lines}/>
                </span>
            </Item.Content>
        </Item>
    );
}

/**
 * Returns true if there is displayable information in this entry.
 * Returns false if there is no data in this entry or this is only a reference to another entry.
 */
function hasData(entry: GedcomEntry) {
    return entry.tree.length > 0 || (entry.data && !entry.data.startsWith("@"));
}

function getOtherDetails(entries: GedcomEntry[]) {
    return entries
        .filter((entry) => !EXCLUDED_TAGS.includes(entry.tag))
        .filter(hasData)
        .map((entry) => dataDetails(entry))
        .filter((element) => element !== null)
        .map((element, index) => (
            <Item key={index}>
                <Item.Content>{element}</Item.Content>
            </Item>
        ));
}

function dataDetails(entry: GedcomEntry) {
    const lines = [];
    if (entry.data)
        lines.push(...getData(entry));
    entry.tree
        .filter((subentry) => subentry.tag === "NOTE")
        .forEach((note) => getData(note).forEach((line) => lines.push(<span>{line}</span>)),);
    if (!lines.length)
        return null;

    return (
        <>
            <Header>
                <TranslatedTag tag={entry.tag}/>
            </Header>
            <span>
                <MultilineText lines={lines}/>
            </span>
        </>
    );
}

function fileDetails(objectEntry: GedcomEntry) {
    const imageFileEntry = getImageFileEntry(objectEntry);
    return imageFileEntry ? (
        <div className="person-image">
            <WrappedImage
                url={imageFileEntry.data}
                filename={getFileName(imageFileEntry) || ""}
            />
        </div>
    ) : null;
}

function noteDetails(entry: GedcomEntry) {
    return (
        <>
            <Header as="span" className="small">
                <TranslatedTag tag={entry.tag}/>
            </Header>
            <MultilineText lines={getData(entry).map((line, index) => (<span key={index}>{line}</span>))}/>
        </>
    );
}

export function Details(props: DetailsProps) {
    const entries = props.gedcom.indis[props.indi].tree;
    const entriesWithData = entries
        .map((entry) => dereference(entry, props.gedcom, (gedcom) => gedcom.other))
        .filter(hasData);

    return (
        <div className="details">
            <Item.Group divided>
                {getDetails(entries, ["NAME"], nameDetails)}
                {getDetails(entriesWithData, ["OBJE"], fileDetails)}
                <Events gedcom={props.gedcom} indi={props.indi} entries={entries}/>
                {getMultilineDetails(entriesWithData, ["LANG"], ["gedcom.languages", "Languages"])}
                {getOtherDetails(entriesWithData)}
                {getDetails(entriesWithData, ["NOTE"], noteDetails)}
            </Item.Group>
        </div>
    );
}
