import {Language} from "../model/language";


export default class CSVLoader {
    // Singleton
    private static languagesData: Language[] | null = null;

    static async loadLanguages(filePath: string) {
        if (CSVLoader.languagesData) {
            return CSVLoader.languagesData;
        }
        try {
            const data = await fetch(filePath);
            const text = await data.text();

            const rows = text.trim().split('\n');
            const headers = rows[0].split(',');

            const idIndex = headers.indexOf('id');
            const nameIndex = headers.indexOf('name');
            const isoIndex = headers.indexOf('ISO 639-3');

            CSVLoader.languagesData = rows.slice(1).map(row => {
                const values = row.split(',');
                return {
                    id: values[idIndex],
                    name: CSVLoader.title_fn(values[nameIndex]),
                    iso: values[isoIndex],
                    abbreviation: values[isoIndex].toUpperCase() || (values[nameIndex].slice(0, 3).toUpperCase() + '*')
                } as Language;
            });
            return CSVLoader.languagesData;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Split by hyphen, underscore, or space.
     */
    private static title_fn = (str: string) =>
        str.split(/[-_\s]/)
           .map(word => word.charAt(0).toUpperCase() + word.slice(1))
           .join('-');
}
