import {ChartColors, EthnicityArg, IdsArg, LanguagesArg, SexArg} from "./config";
import {interpolateNumber} from "d3-interpolate";
import {FormattedMessage, IntlShape, useIntl} from "react-intl";
import {max, min} from "d3-array";
import {Media} from "./util/media-utils";
import {saveAs} from "file-saver";
import {select, Selection} from "d3-selection";
import {useEffect, useRef} from "react";
import "d3-transition";
import {D3ZoomEvent, zoom, ZoomBehavior, ZoomedElementBaseType, zoomTransform,} from "d3-zoom";
import {
    ChartColors as TopolaChartColors,
    ChartHandle,
    createChart,
    DetailedRenderer,
    HourglassChart,
    IndiInfo,
    JsonGedcomData,
    RelativesChart,
} from "./topola";
import {GedcomData, GedcomTreeItem} from "./util/gedcom-utils";

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

const chartColors = new Map<ChartColors, TopolaChartColors>([
    [ChartColors.NO_COLOR, TopolaChartColors.NO_COLOR],
    [ChartColors.COLOR_BY_GENERATION, TopolaChartColors.COLOR_BY_GENERATION],
    [ChartColors.COLOR_BY_SEX, TopolaChartColors.COLOR_BY_SEX],
    [ChartColors.COLOR_BY_ETHNICITY, TopolaChartColors.COLOR_BY_ETHNICITY],
    [ChartColors.COLOR_BY_NR_LANGUAGES, TopolaChartColors.COLOR_BY_NR_LANGUAGES],
    [ChartColors.COLOR_BY_LANGUAGE, TopolaChartColors.COLOR_BY_LANGUAGE]
]);

export interface ChartProps {
    data: JsonGedcomData;
    selection: IndiInfo;
    chartType: ChartType;
    onSelection: (indiInfo: IndiInfo) => void;
    freezeAnimation?: boolean;
    colors?: ChartColors;
    selectedLanguage?: string | null;
    hideLanguages?: LanguagesArg;
    hideEthnicity?: EthnicityArg;
    hideIds?: IdsArg;
    hideSex?: SexArg;
}

/**
 * Called when the view is dragged with the mouse.
 * @param size the size of the chart
 * @param event
 */
function zoomed(size: [number, number], event: D3ZoomEvent<ZoomedElementBaseType, unknown>) {
    const parent = select("#svgContainer").node() as Element;
    const scale = event.transform.k;
    const offsetX = max([0, (parent.clientWidth - size[0] * scale) / 2]);
    const offsetY = max([0, (parent.clientHeight - size[1] * scale) / 2]);
    select("#chartSvg")
        .attr("width", size[0] * scale)
        .attr("height", size[1] * scale)
        .attr("transform", `translate(${offsetX}, ${offsetY})`);
    select("#chart").attr("transform", `scale(${scale})`);
    parent.scrollLeft = -event.transform.x;
    parent.scrollTop = -event.transform.y;
}

/**
 * Called when the scrollbars are used.
 */
function scrolled() {
    const parent = select("#svgContainer").node() as Element;
    const x = parent.scrollLeft + parent.clientWidth / 2;
    const y = parent.scrollTop + parent.clientHeight / 2;
    const scale = zoomTransform(parent).k;
    select(parent).call(zoom().translateTo, x / scale, y / scale);
}

/**
 * Loads blob as data URL.
 */
function loadAsDataUrl(blob: Blob): Promise<string> {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise<string>((resolve) => {
        reader.onload = (e) => resolve((e.target as FileReader).result as string);
    });
}

async function inlineImage(image: SVGImageElement) {
    const href = image.href.baseVal;
    if (!href)
        return;
    try {
        const response = await fetch(href);
        const blob = await response.blob();
        image.href.baseVal = await loadAsDataUrl(blob);
    } catch (e) {
        console.warn("Failed to load image:", e);
    }
}

/**
 * Fetches all images in the SVG and replaces them with inlined images as data URLs.
 * Images are replaced in place. The replacement is done, the returned promise is resolved.
 */
async function inlineImages(svg: Element): Promise<void> {
    const images = Array.from(svg.getElementsByTagName("image"));
    await Promise.all(images.map(inlineImage));
}

/**
 * Loads a blob into an image object.
 */
function loadImage(blob: Blob): Promise<HTMLImageElement> {
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    return new Promise<HTMLImageElement>((resolve) => {
        image.addEventListener("load", () => resolve(image));
    });
}

/**
 * Draw image on a new canvas and return the canvas.
 */
function drawImageOnCanvas(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    // Scale image for better quality.
    canvas.width = image.width * 2;
    canvas.height = image.height * 2;
    const ctx = canvas.getContext("2d")!;
    const oldFill = ctx.fillStyle;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = oldFill;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject();
            }
        }, type);
    });
}

/**
 * Return a copy of the SVG chart but without scaling and positioning.
 */
function getStrippedSvg() {
    const svg = document.getElementById("chartSvg")!.cloneNode(true) as Element;
    svg.removeAttribute("transform");
    const parent = select("#svgContainer").node() as Element;
    const scale = zoomTransform(parent).k;
    svg.setAttribute("width", String(Number(svg.getAttribute("width")) / scale));
    svg.setAttribute(
        "height",
        String(Number(svg.getAttribute("height")) / scale),
    );
    svg.querySelector("#chart")!.removeAttribute("transform");
    return svg;
}

async function getSvgContentsWithInlinedImages() {
    const svg = getStrippedSvg();
    await inlineImages(svg);
    return new XMLSerializer().serializeToString(svg);
}

export async function downloadSvg(filename: string | undefined) {
    const contents = await getSvgContentsWithInlinedImages();
    const blob = new Blob([contents], {type: "image/svg+xml"});
    saveAs(blob, filename ? filename + ".svg" : "genealogy.svg");
}

async function drawOnCanvas(): Promise<HTMLCanvasElement> {
    const contents = await getSvgContentsWithInlinedImages();
    const blob = new Blob([contents], {type: "image/svg+xml"});
    return drawImageOnCanvas(await loadImage(blob));
}

export async function downloadPng(filename: string | undefined) {
    const canvas = await drawOnCanvas();
    const blob = await canvasToBlob(canvas, "image/png");
    saveAs(blob, filename ? filename + ".png" : "genealogy.png");
}

export async function downloadPdf(filename: string | undefined) {
    const {default: jspdf} = await import("jspdf"); // lazy-load jspdf
    const canvas = await drawOnCanvas();
    const doc = new jspdf({
        orientation: canvas.width > canvas.height ? "l" : "p",
        unit: "pt",
        format: [canvas.width, canvas.height],
    });
    doc.addImage(canvas, "PNG", 0, 0, canvas.width, canvas.height, "NONE");
    doc.save(filename ? filename + ".pdf" : "genealogy.pdf");
}

export async function downloadGedcom(gedcom: string, filename: string | undefined) {
    const blob = new Blob([gedcom], {type: "text/plain"});
    saveAs(blob, filename ? filename + ".ged" : "genealogy.ged");
}

export function getFilename(gedcom: GedcomData | undefined) {
    const filename = Object.entries(gedcom?.head || {})
        .filter((k) => k[0] === "tree")
        .map(_ => _[1])
        .map(obj => obj.find((sub: GedcomTreeItem) => sub.tag === "FILE"))
        .map(file => file?.data)[0];
    return !filename ? null : filename.substring(0, filename.lastIndexOf(".")) || filename; // Remove file extension (if any)
}

function getChartType(chartType: ChartType) {
    switch (chartType) {
        case ChartType.Hourglass:
            return HourglassChart;
        case ChartType.Relatives:
            return RelativesChart;
        default:
            return HourglassChart;
    }
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
                colors: chartColors.get(props.colors!),
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
        const transition = args.initialRender ? svg : svgTransition;
        transition.attr("transform", `translate(${offsetX}, ${offsetY})`)
                  .attr("width", chartInfo.size[0] * scale)
                  .attr("height", chartInfo.size[1] * scale);
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
                // Use `this.rerenderProps` instead of the props in scope because the props may have been updated in the meantime
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
                || props.hideSex !== prevProps?.hideSex
                //|| props.selection !== prevProps?.selection;
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
            <Media greaterThanOrEqual="large">
                <div className="legend">
                    <svg>
                        <rect x="10" y="10" width="260" height="60" stroke="black" strokeDasharray="5,5" fill="none" strokeWidth="2"/>
                        <text x="20" y="35" fontSize="16" fill="black"><FormattedMessage id="legend.stroke.1" defaultMessage="Individuals with a dashed line"/></text>
                        <text x="60" y="55" fontSize="16" fill="black"><FormattedMessage id="legend.stroke.2" defaultMessage="have more relatives"/></text>
                    </svg>
                </div>
            </Media>
        </div>
    );
}
