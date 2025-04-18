import {useIntl} from "react-intl";

export class CouldNotReadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CouldNotReadError";
    }
}
export class EmptyFileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EmptyFileError";
    }
}
export class InvalidHeaderError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidHeaderError";
    }
}
export class MissingColumnsError extends Error {
    missingColumns: string[];
    constructor(message: string, missingColumns: string[]) {
        super(message);
        this.name = "MissingColumnsError";
        this.missingColumns = missingColumns;
    }
}

export const useValidationSchemas = () => {  // custom hook naming convention
    const i18n = useIntl();

    const individualsFilename = i18n.formatMessage({id: "individuals.tsv", defaultMessage: "1-individuals.tsv"});
    const parentsFilename = i18n.formatMessage({id: "parents.tsv", defaultMessage: "2-parents.tsv"});
    const relationshipsFilename = i18n.formatMessage({id: "relationships.tsv", defaultMessage: "3-relationships.tsv"});

    const individualsFileColumns = i18n.formatMessage({
        id: "individuals.file.columns",
        defaultMessage: "*individual_id, name, surname1, surname2, nickname, *gender, birth_date, birth_place, notes"
    }).split(", ");
    const parentsFileColumns = i18n.formatMessage({
        id: "parents.file.columns",
        defaultMessage: "*individual_id, *father_id, *mother_id"
    }).split(", ");
    const relationshipsFileColumns = i18n.formatMessage({
        id: "relationships.file.columns",
        defaultMessage: "*husband_id, *wife_id, notes"
    }).split(", ");

    // { filenames: required columns }
    return {
        [individualsFilename]: individualsFileColumns,
        [parentsFilename]: parentsFileColumns,
        [relationshipsFilename]: relationshipsFileColumns
    };
}