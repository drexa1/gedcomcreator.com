import {useIntl} from "react-intl";
import Papa from "papaparse";

export class CouldNotReadError extends Error {}

export class EmptyFileError extends Error {}

export class MissingColumnsError extends Error {
    public missingColumns: string[];
    constructor(message: string, missingColumns: string[]) {
        super(message);
        this.missingColumns = missingColumns;
    }
}

export const useValidationSchemas = () => {  // custom hook naming convention
    const i18n = useIntl();

    const individualsFilename = i18n.formatMessage({ id: "individuals.csv", defaultMessage: "1-individuals.csv" });
    const parentsFilename = i18n.formatMessage({ id: "parents.csv", defaultMessage: "2-parents.csv" });
    const relationshipsFilename = i18n.formatMessage({ id: "relationships.csv", defaultMessage: "3-relationships.csv" });

    const individualsFileColumns = i18n.formatMessage({
        id: "individuals.file.columns",
        defaultMessage: "individual_id, name, surname1, surname2, nickname, gender, birth_date, birth_place, notes"
    }).split(", ");
    const parentsFileColumns = i18n.formatMessage({
        id: "parents.file.columns",
        defaultMessage: "individual_id, father_id, mother_id"
    }).split(", ");
    const relationshipsFileColumns = i18n.formatMessage({
        id: "relationships.file.columns",
        defaultMessage: "husband_id, wife_id, notes"
    }).split(", ");

    // { filenames: required columns }
    return {
        [individualsFilename]: individualsFileColumns,
        [parentsFilename]: parentsFileColumns,
        [relationshipsFilename]: relationshipsFileColumns
    };
};

export function validateFilenames(files: FileList, expectedFilenames: string[]): Set<string> {
    const validFilenames = new Set<string>();
    const invalidFilenames = new Set<string>();
    Array.from(files).forEach(file => (expectedFilenames.includes(file.name) ? validFilenames : invalidFilenames).add(file.name));
    if (invalidFilenames.size > 0) {
        console.error(`These are not the 🤖 we are looking for: ${[...invalidFilenames].join(", ")}`);
    }
    return validFilenames;
}

export function validateFile(filename: string, content: string, validationSchemas: Record<string, string[]>): boolean {
    const parsedData = Papa.parse(content, { header: true, skipEmptyLines: true });
    if (parsedData.errors.length) {
        throw new CouldNotReadError(filename)
    }
    const rows = parsedData.data as Record<string, string>[];
    if (!rows.length) {
        throw new EmptyFileError(filename)
    }
    return validateColumns(filename, rows, validationSchemas[filename])
}

function validateColumns(filename: string, rows: Record<string, string>[], requiredColumns: string[]): boolean {
    const headers = Object.keys(rows[0]);
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length) {
        throw new MissingColumnsError(filename, missingColumns)
    }
    return true;
}
