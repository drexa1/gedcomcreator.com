import {useIntl} from "react-intl";

export const useValidationSchemas = () => {  // custom hook naming convention
    const i18n = useIntl();

    const individualsFilename = i18n.formatMessage({id: "individuals.csv", defaultMessage: "1-individuals.csv"});
    const parentsFilename = i18n.formatMessage({id: "parents.csv", defaultMessage: "2-parents.csv"});
    const relationshipsFilename = i18n.formatMessage({id: "relationships.csv", defaultMessage: "3-relationships.csv"});

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