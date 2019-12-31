/// <reference types="react" />
import { SCanvas, Point2D } from "solandra";
import { SCanvasNonDrawing } from "solandra/sCanvas";
export declare type GameState = {
    presses: number;
};
export declare type RenderFn<S> = (canvas: SCanvas, state: S) => void;
export declare type Update = {
    kind: "time";
    time: number;
    dT: number;
} | {
    kind: "key";
    key: string;
    event: "up" | "down";
} | {
    kind: "click";
    at: Point2D;
};
export declare type UpdateFn<S> = (state: S, update: Update, sCanvas: SCanvasNonDrawing) => S | void;
export declare type GameProps<S> = {
    render: RenderFn<S>;
    update: UpdateFn<S>;
    initialState: S;
};
export declare type GameConfig = {
    width: number;
    height: number;
    seed: number;
};
export declare class GameService<S> {
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    sCanvas: SCanvas | null;
    render: RenderFn<S>;
    update: UpdateFn<S>;
    state: S;
    lastSCanvas?: SCanvas;
    width: number;
    height: number;
    seed: number;
    startTime: number;
    time: number;
    constructor({ render, update, initialState }: {
        render: RenderFn<S>;
        update: UpdateFn<S>;
        initialState: S;
    });
    sizing: () => void;
    applyUpdate: (u: Update) => void;
    timeout: number | null;
    sizingWithTimeout: () => void;
    setCanvas(canvas: HTMLCanvasElement): void;
    draw: () => void;
    updateTime: () => void;
}
export default function Game<S>({ render, update, initialState }: GameProps<S>): JSX.Element;
