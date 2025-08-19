import f3 from "family-chart";
import {useEffect, useRef} from "react";
import {IntlShape, useIntl} from "react-intl";
import {IndiInfo, JsonFam, JsonGedcomData} from "./topola";
import {formatDateOrRange} from "./utils/date-utils";
import "./styles/family-chart.css";

export interface DonatsoChartProps {
    data: JsonGedcomData;
    selection: IndiInfo;
    onSelection: (indiInfo: IndiInfo) => void;
}

function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function convertData(data: JsonGedcomData, intl: IntlShape) {
    const famMap = new Map<string, JsonFam>();
    data.fams.forEach((fam) => famMap.set(fam.id, fam));
    return data.indis.map((indi) => {
        const famc = famMap.get(indi.famc!);
        const fams = (indi.fams || []).map((fam) => famMap.get(fam)).filter((fam): fam is JsonFam => fam !== undefined);
        const father = famc?.husb;
        const mother = famc?.wife;
        const spouses = fams.map((fam) => getOtherSpouse(fam, indi.id)).filter((indi): indi is string => indi !== undefined);
        const children = fams.flatMap((fam) => fam.children || []);
        return {
            id: indi.id,
            data: {
                "first name": indi.firstName,
                "last name": indi.lastName,
                gender: indi.sex,
                birthday: formatDateOrRange(indi.birth, intl),
                death: formatDateOrRange(indi.death, intl),
                avatar: indi.images?.[0]?.url
            },
            rels: {father, mother, spouses, children}
        };
    });
}

function getOtherSpouse(fam: JsonFam, indi: string) {
    return fam.husb === indi ? fam.wife : fam.husb;
}

class ChartWrapper {
    private f3Chart: any;

    initializeChart(props: DonatsoChartProps, intl: IntlShape) {
        const data = convertData(props.data, intl);
        this.f3Chart = f3.createChart("#FamilyChart", data)
            .setTransitionTime(500)
            .setCardXSpacing(300)
            .setCardYSpacing(150)
        this.f3Chart.setCard(f3.CardSvg)
            .setCardDisplay([["first name","last name"],["birthday"],["death"]])
            .setCardDim({w:250,h:100,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5})
            .setOnCardUpdate(function() {})
        this.f3Chart.updateTree({initial: true})
    }

    updateChart(props: DonatsoChartProps, intl: IntlShape) {
        const data = convertData(props.data, intl);
        this.f3Chart.updateData(data);
        this.f3Chart.updateMainId(props.selection.id);
        this.f3Chart.updateTree();
    }
}

export function DonatsoChart(props: DonatsoChartProps) {
    const chartWrapper = useRef(new ChartWrapper());
    const prevProps = usePrevious(props);
    const intl = useIntl();

    useEffect(() => {
        if (!prevProps) {
            chartWrapper.current.initializeChart(props, intl);
        } else {
            chartWrapper.current.updateChart(props, intl);
        }
    });

    return <div id="FamilyChart"></div>;
}