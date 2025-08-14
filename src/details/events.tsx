import * as queryString from "query-string";
import flatMap from "array.prototype.flatmap";
import {compareDates, formatDateOrRange} from "../utils/date-utils";
import {GedcomData, getName, pointerToId,} from "../utils/gedcom-utils";
import {GedcomEntry} from "parse-gedcom";
import {FormattedMessage, useIntl} from "react-intl";
import {Link, useLocation} from "react-router-dom";
import {TranslatedTag} from "./translated-tag";
import {Header, Item} from "semantic-ui-react";
import {EventExtras} from "./event-extras";
import {EventData, toEvent} from "../utils/event-utils";


const EVENT_TAGS = ["BIRT", "BAPM", "CHR", "FAMS", "EVEN", "CENS", "DEAT", "BURI"];

interface EventProps {
    gedcom: GedcomData;
    indi: string;
    entries: GedcomEntry[];
}

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

export function Events(props: EventProps) {
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
