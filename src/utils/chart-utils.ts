import {D3ZoomEvent, zoom, ZoomedElementBaseType, zoomTransform} from "d3-zoom";
import {select} from "d3-selection";
import {max} from "d3-array";
import {saveAs} from "file-saver";
import {GedcomData, GedcomTreeItem} from "./gedcom-utils";
import {HourglassChart, JsonGedcomData, RelativesChart} from "../topola";
import {ChartType} from "../chart";

export function getChartType(chartType: ChartType) {
    switch (chartType) {
        case ChartType.Hourglass:
            return HourglassChart;
        case ChartType.Relatives:
            return RelativesChart;
        default:
            return HourglassChart;
    }
}

/**
 * Called when the view is dragged with the mouse.
 * @param size the size of the chart
 * @param event
 */
export function zoomed(size: [number, number], event: D3ZoomEvent<ZoomedElementBaseType, unknown>) {
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
export function scrolled() {
    const parent = select("#svgContainer").node() as Element;
    const x = parent.scrollLeft + parent.clientWidth / 2;
    const y = parent.scrollTop + parent.clientHeight / 2;
    const scale = zoomTransform(parent).k;
    select(parent).call(zoom().translateTo, x / scale, y / scale);
}

/**
 * Loads blob as data URL.
 */
export function loadAsDataUrl(blob: Blob): Promise<string> {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise<string>((resolve) => {
        reader.onload = (e) => resolve((e.target as FileReader).result as string);
    });
}

export async function inlineImage(image: SVGImageElement) {
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
export async function inlineImages(svg: Element): Promise<void> {
    const images = Array.from(svg.getElementsByTagName("image"));
    await Promise.all(images.map(inlineImage));
}

/**
 * Loads a blob into an image object.
 */
export function loadImage(blob: Blob): Promise<HTMLImageElement> {
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    return new Promise<HTMLImageElement>((resolve) => {
        image.addEventListener("load", () => resolve(image));
    });
}

/**
 * Draw image on a new canvas and return the canvas.
 */
export function drawImageOnCanvas(image: HTMLImageElement) {
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

export function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
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
export function getStrippedSvg() {
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

export async function getSvgContentsWithInlinedImages() {
    const svg = getStrippedSvg();
    await inlineImages(svg);
    return new XMLSerializer().serializeToString(svg);
}

export async function downloadSvg(filename: string | undefined) {
    const contents = await getSvgContentsWithInlinedImages();
    const blob = new Blob([contents], {type: "image/svg+xml"});
    saveAs(blob, filename ? filename + ".svg" : "genealogy.svg");
}

export async function drawOnCanvas(): Promise<HTMLCanvasElement> {
    const contents = await getSvgContentsWithInlinedImages();
    const blob = new Blob([contents], {type: "image/svg+xml"});
    return drawImageOnCanvas(await loadImage(blob));
}

export function enoughLegendSpace(data: JsonGedcomData): boolean {
    // TODO: check how many items are in the config stack
    return true
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* EVENT HANDLERS HELPERS                                                                                             */
/* ------------------------------------------------------------------------------------------------------------------ */

export function getFilename(gedcom: GedcomData | undefined) {
    const filename = Object.entries(gedcom?.head || {})
        .filter((k) => k[0] === "tree")
        .map(_ => _[1])
        .map(obj => obj.find((sub: GedcomTreeItem) => sub.tag === "FILE"))
        .map(file => file?.data)[0];
    return !filename ? null : filename.substring(0, filename.lastIndexOf(".")) || filename; // Remove file extension (if any)
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
