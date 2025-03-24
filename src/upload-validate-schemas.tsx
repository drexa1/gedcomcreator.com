import {useIntl} from "react-intl";

export const useValidationSchemas = (): Set<string> => {  // custom hook naming convention
    const i18n = useIntl();
    return new Set([
        i18n.formatMessage({ id: "individuals.csv", defaultMessage: "1-individuals.csv" }),
        i18n.formatMessage({ id: "parents.csv", defaultMessage: "2-parents.csv" }),
        i18n.formatMessage({ id: "relationships.csv", defaultMessage: "3-relationships.csv" })
    ]);
};

