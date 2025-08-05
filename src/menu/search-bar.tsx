import debounce from "debounce";
import {buildSearchIndex, SearchUtils, SearchResult, getDescriptionLine} from "../utils/search-utils";
import {IndiInfo, JsonGedcomData} from "../topola";
import {Search, SearchResultProps} from "semantic-ui-react";
import {useEffect, useRef, useState} from "react";
import {useIntl} from "react-intl";


interface Props {
    data: JsonGedcomData;
    onSelection: (indiInfo: IndiInfo) => void;
}

export function SearchBar(props: Props) {
    const [searchResults, setSearchResults] = useState<SearchResultProps[]>([]);
    const [searchString, setSearchString] = useState("");
    const searchIndex = useRef<SearchUtils>();
    const debouncedHandleSearch = useRef(debounce(handleSearch, 200));
    const intl = useIntl();

    useEffect(() => {
        searchIndex.current = buildSearchIndex(props.data);
    }, [props.data]);

    /**
     * Produces an object that is displayed in the Semantic UI Search results.
     */
    function displaySearchResult(result: SearchResult): SearchResultProps {
        return {
            id: result.id,
            key: result.id,
            title: getNameLine(result),
            description: getDescriptionLine(result.indi, intl),
        } as SearchResultProps;
    }

    function handleSearch(input: string | undefined) {
        if (!input)
            return;
        const results = searchIndex.current!
            .search(input)
            .map((result) => displaySearchResult(result));
        setSearchResults(results);
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
