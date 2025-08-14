import {FormattedMessage} from "react-intl";


const TAG_DESCRIPTIONS = new Map([
    ["ADOP", "Adoption"],
    ["BAPM", "Baptism"],
    ["BIRT", "Birth"],
    ["BURI", "Burial"],
    ["CENS", "Census"],
    ["CHR", "Christening"],
    ["CREM", "Cremation"],
    ["DEAT", "Death"],
    ["DIV", "Divorce"],
    ["EDUC", "Education"],
    ["EMAIL", "E-mail"],
    ["EMIG", "Emigration"],
    ["ETHN", "Ethnic"],
    ["EVEN", "Event"],
    ["FACT", "Fact"],
    ["IMMI", "Immigration"],
    ["LANG", "Language"],
    ["MARR", "Marriage"],
    ["MARS", "Marriage settlement"],
    ["MILT", "Military services"],
    ["NOTE", "Comments"],
    ["NATU", "Naturalization"],
    ["OCCU", "Occupation"],
    ["TITL", "Title"],
    ["TRIB", "Clan"],
    ["WWW", "WWW"],
    ["aka", "Also known as"],
    ["birth", "Birth name"],
    ["immigrant", "Immigrant name"],
    ["maiden", "Maiden name"],
    ["married", "Married name"]
]);

export function TranslatedTag({ tag }: { tag: string }) {
    const normalizedTag = tag.replace(/_/g, "");
    return (
        <FormattedMessage id={`gedcom.${normalizedTag}`} defaultMessage={TAG_DESCRIPTIONS.get(normalizedTag) || normalizedTag}/>
    );
}
