import {interpolateNumber} from "d3-interpolate";
import {FormattedMessage, IntlShape, useIntl} from "react-intl";
import {max, min} from "d3-array";
import {Media} from "./utils/media-utils";
import {select, Selection} from "d3-selection";
import {useEffect, useRef, useState} from "react";
import "d3-transition";
import {zoom, ZoomBehavior, zoomTransform,} from "d3-zoom";
import {
    ChartColors as TopolaChartColors,
    ChartHandle,
    createChart,
    DetailedRenderer,
    IndiInfo,
    JsonGedcomData,
} from "./topola";
import {enoughLegendSpace, getChartType, scrolled, zoomed} from "./utils/chart-utils";
import {EthnicityArg, IdsArg, LanguagesArg, SexArg} from "./config";
import {IndividualLanguage} from "./model/individual";


/**
 * How much to zoom when using the +/- buttons.
 */
const ZOOM_FACTOR = 1.3;

/**
 * Supported chart types.
 */
export enum ChartType {
    Hourglass,
    Relatives
}

export interface ChartProps {
    data: JsonGedcomData;
    selection: IndiInfo;
    chartType: ChartType;
    onSelection: (indiInfo: IndiInfo) => void;
    freezeAnimation?: boolean;
    colors?: TopolaChartColors;
    selectedLanguage?: string | null;
    hideLanguages?: LanguagesArg;
    hideEthnicity?: EthnicityArg;
    hideIds?: IdsArg;
    hideSex?: SexArg;
    languageOptions?: IndividualLanguage[];
}

class ChartWrapper {
    private chart?: ChartHandle;
    private animating = false;
    private rerenderRequired = false;
    private zoomBehavior?: ZoomBehavior<Element, any>;
    private rerenderProps?: ChartProps;
    private rerenderResetPosition?: boolean;

    zoom(factor: number) {
        const parent = select("#svgContainer") as Selection<Element, any, any, any>;
        this.zoomBehavior!.scaleBy(parent, factor);
    }

    /**
     * Renders the chart or performs a transition animation to a new state.
     * If indiInfo is not given, it means that it is the initial render and no animation is performed.
     */
    renderChart(
        props: ChartProps,
        intl: IntlShape,
        args: { initialRender: boolean; resetPosition: boolean } = {
            initialRender: false,
            resetPosition: false,
        }
    ) {
        // Wait for animation to finish if animation is in progress
        if (!args.initialRender && this.animating) {
            this.rerenderRequired = true;
            this.rerenderProps = props;
            this.rerenderResetPosition = args.resetPosition;
            return;
        }

        // Freeze changing selection after initial rendering
        if (!args.initialRender && props.freezeAnimation) {
            return;
        }

        if (args.initialRender) {
            (select("#chart").node() as HTMLElement).innerHTML = "";
            this.chart = createChart({
                json: props.data,
                chartType: getChartType(props.chartType),
                renderer: DetailedRenderer,
                svgSelector: "#chart",
                indiCallback: (info) => props.onSelection(info),
                colors: props.colors!,
                selectedLanguage: props.selectedLanguage,
                animate: true,
                updateSvgSize: false,
                locale: intl.locale,
            });
        } else {
            this.chart!.setData(props.data);
        }

        const chartInfo = this.chart!.render({
            startIndi: props.selection.id,
            baseGeneration: props.selection.generation,
        });

        const svg = select("#chartSvg");
        const parent = select("#svgContainer").node() as Element;
        const scale = zoomTransform(parent).k;
        const zoomOutFactor = min([
            1,
            scale,
            parent.clientWidth / chartInfo.size[0],
            parent.clientHeight / chartInfo.size[1],
        ])!;
        const extent: [number, number] = [max([0.1, zoomOutFactor])!, 2];

        this.zoomBehavior = zoom()
            .scaleExtent(extent)
            .translateExtent([[0, 0], chartInfo.size])
            .on("zoom", (event) => zoomed(chartInfo.size, event));
        select(parent).on("scroll", scrolled).call(this.zoomBehavior);

        const scrollTopTween = (scrollTop: number) => {
            return () => {
                const i = interpolateNumber(parent.scrollTop, scrollTop);
                return (t: number) => parent.scrollTop = i(t);
            }
        };
        const scrollLeftTween = (scrollLeft: number) => {
            return () => {
                const i = interpolateNumber(parent.scrollLeft, scrollLeft);
                return (t: number) => parent.scrollLeft = i(t);
            }
        };

        const dx = parent.clientWidth / 2 - chartInfo.origin[0] * scale;
        const dy = parent.clientHeight / 2 - chartInfo.origin[1] * scale;
        const offsetX = max([0, (parent.clientWidth - chartInfo.size[0] * scale) / 2]);
        const offsetY = max([0, (parent.clientHeight - chartInfo.size[1] * scale) / 2]);
        const svgTransition = svg.transition().delay(200).duration(500);
        if (args.initialRender) {
            svg.attr("transform", `translate(${offsetX}, ${offsetY})`)
                .attr("width", chartInfo.size[0] * scale)
                .attr("height", chartInfo.size[1] * scale);
        } else {
            svgTransition.attr("transform", `translate(${offsetX}, ${offsetY})`)
                .attr("width", chartInfo.size[0] * scale)
                .attr("height", chartInfo.size[1] * scale);
        }
        if (args.resetPosition) {
            if (args.initialRender) {
                parent.scrollLeft = -dx;
                parent.scrollTop = -dy;
            } else {
                svgTransition.tween("scrollLeft", scrollLeftTween(-dx)).tween("scrollTop", scrollTopTween(-dy));
            }
        }

        this.animating = true;
        // After the animation is finished, re-render the chart if required
        chartInfo.animationPromise.then(() => {
            this.animating = false;
            if (this.rerenderRequired) {
                this.rerenderRequired = false;
                // Use this.rerenderProps instead of the props in scope because the props may have been updated in the meantime
                this.renderChart(this.rerenderProps!, intl, {
                    initialRender: false,
                    resetPosition: !!this.rerenderResetPosition,
                });
            }
        });
    }
}

export function Chart(props: ChartProps) {
    const chartWrapper = useRef(new ChartWrapper());
    const prevProps = usePrevious(props);
    const [waveOnce, setWaveOnce] = useState(false);
    const intl = useIntl();

    useEffect(() => {
        if (prevProps) {
            const initialRender =
                props.chartType !== prevProps?.chartType
                || props.colors !== prevProps?.colors
                || props.selectedLanguage !== prevProps?.selectedLanguage
                || props.hideLanguages !== prevProps?.hideLanguages
                || props.hideEthnicity !== prevProps?.hideEthnicity
                || props.hideIds !== prevProps?.hideIds
                || props.hideSex !== prevProps?.hideSex;
            const resetPosition =
                props.chartType !== prevProps?.chartType
                || props.data !== prevProps.data
                || props.selection !== prevProps.selection;
            // non-first render
            chartWrapper.current.renderChart(props, intl, {
                initialRender,
                resetPosition,
            });
        } else {
            // first render
            chartWrapper.current.renderChart(props, intl, {
                initialRender: true,
                resetPosition: true,
            });
        }
    });

    /**
     * If there is a hidden relatives case, animate the hint once
     */
    useEffect(() => {
        setWaveOnce(true);
        const timer = setTimeout(() => setWaveOnce(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    function usePrevious<T>(value: T): T | undefined {
        const ref = useRef<T>();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }

    return (
        <div id="svgContainer">
            <Media greaterThanOrEqual="large" className="zoom">
                <button className="zoom-in" onClick={() => chartWrapper.current.zoom(ZOOM_FACTOR)}>+</button>
                <button className="zoom-out" onClick={() => chartWrapper.current.zoom(1 / ZOOM_FACTOR)}>−</button>
            </Media>
            <svg id="chartSvg">
                <g id="chart"/>
            </svg>
            {enoughLegendSpace(props.languageOptions) && (
                <Media greaterThanOrEqual="large">
                    <>
                        <div id="legend-emoji" className={`legend-emoji ${waveOnce ? "wave-once" : ""}`}>👋</div>
                        <div id="legend" className="legend">
                            <svg>
                                <rect x="10" y="10" width="275" height="60" stroke="black" strokeDasharray="5,5" fill="none" strokeWidth="2"/>
                                <text x={275} y={35} fontSize="16" fill="black" textAnchor="middle">
                                    <tspan x={275 / 2} dy="0">
                                        <FormattedMessage id="legend.stroke.1" defaultMessage="Individuals with a dashed line"/>
                                    </tspan>
                                    <tspan x={275 / 2} dy="20">
                                        <FormattedMessage id="legend.stroke.2" defaultMessage="have more relatives"/>
                                    </tspan>
                                </text>
                            </svg>
                        </div>
                    </>
                </Media>
            )}
        </div>
    );
}
