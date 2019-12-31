import React, { useEffect, useRef } from "react";
import { SCanvas, Point2D } from "solandra";
import { SCanvasNonDrawing } from "solandra/sCanvas";

const document_ =
  typeof document === "undefined"
    ? { onkeydown: () => {}, onkeyup: () => {} }
    : document;

const window_ =
  typeof window === "undefined"
    ? { innerWidth: 1024, innerHeight: 768, onresize: () => {} }
    : window;

export type GameState = {
  presses: number;
};

export type RenderFn<S> = (canvas: SCanvas, state: S) => void;

export type Update =
  | { kind: "time"; time: number; dT: number }
  | { kind: "key"; key: string; event: "up" | "down" }
  | { kind: "click"; at: Point2D };

export type UpdateFn<S> = (
  state: S,
  update: Update,
  sCanvas: SCanvasNonDrawing
) => S | void;

export type GameProps<S> = {
  render: RenderFn<S>;
  update: UpdateFn<S>;
  initialState: S;
};

export type GameConfig = {
  width: number;
  height: number;
  seed: number;
};

export class GameService<S> {
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  sCanvas: SCanvas | null = null;
  render: RenderFn<S>;
  update: UpdateFn<S>;
  state: S;
  lastSCanvas?: SCanvas;

  width: number = 1024;
  height: number = 768;
  seed: number = 0;

  startTime: number;
  time: number = 0;

  constructor({
    render,
    update,
    initialState
  }: {
    render: RenderFn<S>;
    update: UpdateFn<S>;
    initialState: S;
  }) {
    this.render = render;
    this.update = update;
    this.state = initialState;

    window_.onresize = this.sizingWithTimeout;
    this.sizing();

    this.startTime = new Date().getTime();

    document_.onkeydown = (ev: KeyboardEvent) => {
      this.applyUpdate({
        kind: "key",
        key: ev.key,
        event: "down"
      });
    };

    document_.onkeyup = (ev: KeyboardEvent) => {
      this.applyUpdate({
        kind: "key",
        key: ev.key,
        event: "up"
      });
    };
  }

  sizing = () => {
    this.width = window_.innerWidth;
    this.height = window_.innerHeight;

    if (this.canvas) {
      this.canvas!.width = this.width;
      this.canvas!.height = this.height;
    }

    if (this.sCanvas) {
      this.sCanvas.updateSize({ width: this.width, height: this.height });
    }
  };

  /**
   * If return something from update, replace state,
   * otherwise assume mutations have taken place
   */
  applyUpdate = (u: Update) => {
    const updateRes = this.update(this.state, u, this.sCanvas!);
    if (updateRes) this.state = updateRes;
  };

  timeout: number | null = null;
  sizingWithTimeout = () => {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = (setTimeout(this.sizing, 50) as unknown) as number;
  };

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.sizing();
    this.draw();

    this.canvas.onclick = (evt: MouseEvent) => {
      const { top, left, right } = this.canvas!.getBoundingClientRect();
      const w = right - left;
      const x = evt.clientX - left;
      const y = evt.clientY - top;
      this.applyUpdate({
        kind: "click",
        at: [x / w, y / w]
      });
    };
  }

  draw = () => {
    const oldT = this.time;
    this.updateTime();
    const dT = this.time - oldT;

    this.applyUpdate({
      kind: "time",
      time: this.time,
      dT
    });

    if (!this.sCanvas) {
      this.sCanvas = new SCanvas(
        this.ctx!,
        { width: this.width, height: this.height },
        this.seed,
        this.time
      );
    } else {
      this.sCanvas.updateTime(this.time);
    }

    this.render(this.sCanvas, this.state);
    requestAnimationFrame(this.draw);
  };

  updateTime = () => {
    this.time = (new Date().getTime() - this.startTime) / 1000.0;
  };
}

export default function Game<S>({
  render,
  update,
  initialState
}: GameProps<S>) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const gameService = useRef<GameService<S>>();
  if (!gameService.current)
    gameService.current = new GameService<S>({
      render,
      initialState,
      update
    });

  useEffect(() => {
    gameService.current?.setCanvas(canvasRef.current!);
  }, [canvasRef]);

  // @ts-ignore
  return <canvas ref={canvasRef} />;
}
