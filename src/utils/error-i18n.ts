import {IntlShape} from 'react-intl';

export interface ErrorPopupProps {
    message?: string;
    open: boolean;
    onDismiss: () => void;
}

export class I18nError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly args: { [key: string]: string } = {},
    ) {
        super(message);
    }
}

/**
 * Returns a translated message for the given error. If the message can't be
 * translated, the original error.message is returned.
 */
export function getI18nMessage(error: Error, intl: IntlShape): string {
    if (!(error instanceof I18nError)) {
        return error.message;
    }
    return intl.formatMessage(
        {
            id: `error.${error.code}`,
            defaultMessage: error.message,
        },
        error.args,
    );
}

