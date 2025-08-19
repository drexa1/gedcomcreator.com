declare module "family-chart" {
    /** Core entry point: create a chart inside a DOM container */
    export function createChart(container: string | HTMLElement, data: any): Chart;

    /** Built-in card renderers */
    export class CardHtml {}
    export class CardSvg {}

    /** Card dimension configuration */
    export interface CardDim {
        w: number;
        h: number;
        text_x: number;
        text_y: number;
        img_w: number;
        img_h: number;
        img_x: number;
        img_y: number;
    }

    /** Chart API (fluent/builder style) */
    export interface Chart {
        /** Animation transition time (ms) */
        setTransitionTime(ms: number): Chart;

        /** Horizontal spacing between cards */
        setCardXSpacing(px: number): Chart;

        /** Vertical spacing between cards */
        setCardYSpacing(px: number): Chart;

        /** Card dimensions (size and text/img offsets) */
        setCardDim(dim: CardDim): Chart;

        /** Whether to render an empty card for single parents */
        setSingleParentEmptyCard(v: boolean): Chart;

        /** Renderer: f3.CardHtml or f3.CardSvg */
        setCard(card: any): Chart;

        /**
         * Display rows inside each card.
         * Can be an array of field names or functions.
         */
        setCardDisplay(
            display: (string | ((d: any) => string))[][]
        ): Chart;

        /** Callback to customize card DOM after render */
        setOnCardUpdate(cb: (this: HTMLElement, d: any) => void): Chart;

        /** Callback on card click */
        setOnCardClick(cb: (d: any) => void): Chart;

        /** Callback on card right-click */
        setOnCardRightClick(cb: (d: any) => void): Chart;

        /** Callback on card hover */
        setOnCardHover(cb: (d: any) => void): Chart;

        /** Enable/disable zooming */
        setZoom(enable: boolean): Chart;

        /** Update the tree view */
        updateTree(opts?: { initial?: boolean }): void;
    }
}
