/**
 * Type definitions for the parse-gedcom library.
 */
declare module "gedcom-parse" {
    import {Language} from "src/model/language";
    export function parse(input: string, allLanguages: Language[]): GedcomEntry[];
}
