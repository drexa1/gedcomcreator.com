import debounce from "debounce";
import {buildSearchIndex, SearchIndex, SearchResult} from "./search-index";
import {formatDateOrRange} from "../util/date-utils";
import {IndiInfo, JsonGedcomData, JsonIndi} from "../topola";
import {Search, SearchResultProps} from "semantic-ui-react";
import {useEffect, useRef, useState} from "react";
import {useIntl} from "react-intl";

interface Props {
    /** Data used for the search index. */
    data: JsonGedcomData;
    onSelection: (indiInfo: IndiInfo) => void;
}

/** Displays and handles the search box in the top bar. */
export function SearchBar(props: Props) {
    const [searchResults, setSearchResults] = useState<SearchResultProps[]>([]);
    const [searchString, setSearchString] = useState("");
    const searchIndex = useRef<SearchIndex>();
    const debouncedHandleSearch = useRef(debounce(handleSearch, 200));
    const intl = useIntl();

    // Initialize the search index.
    useEffect(() => {
        searchIndex.current = buildSearchIndex(props.data);
    }, [props.data]);

    /** On search input change. */
    function handleSearch(input: string | undefined) {
        if (!input) {
            return;
        }
        const results = searchIndex
            .current!.search(input)
            .map((result) => displaySearchResult(result));
        setSearchResults(results);
    }

    /** Produces an object that is displayed in the Semantic UI Search results. */
    function displaySearchResult(result: SearchResult): SearchResultProps {
        return {
            id: result.id,
            key: result.id,
            title: getNameLine(result),
            description: getDescriptionLine(result.indi),
        } as SearchResultProps;
    }

    function getNameLine(result: SearchResult) {
        const name = [result.indi.firstName, result.indi.lastName].join(" ").trim();
        if (result.id.length > 8)
            return name;
        return (
            <>
                {name} <i>({result.id})</i>
            </>
        );
    }

    function getDescriptionLine(indi: JsonIndi) {
        const birthDate = formatDateOrRange(indi.birth, intl);
        const deathDate = formatDateOrRange(indi.death, intl);
        if (!deathDate) {
            return birthDate;
        }
        return `${birthDate} – ${deathDate}`;
    }

// ---------------------------------------------------------------------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------------------------------------------------------------------
    function onChange(value: string) {
        debouncedHandleSearch.current(value);
        setSearchString(value);
    }

    function onResultSelect(id: string) {
        props.onSelection({id, generation: 0});
        setSearchString("");
    }
// ---------------------------------------------------------------------------------------------------------------------

    return (
        <Search
            onSearchChange={(_, data) => onChange(data.value!)}
            onResultSelect={(_, data) => onResultSelect(data.result.id)}
            results={searchResults}
            noResultsMessage={intl.formatMessage({id: "menu.search.no_results", defaultMessage: "No results found"})}
            placeholder={intl.formatMessage({id: "menu.search.placeholder", defaultMessage: "Search for people"})}
            selectFirstResult={true}
            value={searchString}
            id="search"
        />
    );
}
