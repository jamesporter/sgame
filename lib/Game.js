"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const solandra_1 = require("solandra");
const document_ = typeof document === "undefined"
    ? { onkeydown: () => { }, onkeyup: () => { } }
    : document;
const window_ = typeof window === "undefined"
    ? { innerWidth: 1024, innerHeight: 768, onresize: () => { } }
    : window;
class GameService {
    constructor({ render, update, initialState }) {
        this.canvas = null;
        this.ctx = null;
        this.sCanvas = null;
        this.width = 1024;
        this.height = 768;
        this.seed = 0;
        this.time = 0;
        this.sizing = () => {
            this.width = window_.innerWidth;
            this.height = window_.innerHeight;
            if (this.canvas) {
                this.canvas.width = this.width;
                this.canvas.height = this.height;
            }
            if (this.sCanvas) {
                this.sCanvas.updateSize({ width: this.width, height: this.height });
            }
        };
        this.applyUpdate = (u) => {
            const updateRes = this.update(this.state, u, this.sCanvas);
            if (updateRes)
                this.state = updateRes;
        };
        this.timeout = null;
        this.sizingWithTimeout = () => {
            if (this.timeout)
                clearTimeout(this.timeout);
            this.timeout = setTimeout(this.sizing, 50);
        };
        this.draw = () => {
            const oldT = this.time;
            this.updateTime();
            const dT = this.time - oldT;
            this.applyUpdate({
                kind: "time",
                time: this.time,
                dT
            });
            if (!this.sCanvas) {
                this.sCanvas = new solandra_1.SCanvas(this.ctx, { width: this.width, height: this.height }, this.seed, this.time);
            }
            else {
                this.sCanvas.updateTime(this.time);
            }
            this.render(this.sCanvas, this.state);
            requestAnimationFrame(this.draw);
        };
        this.updateTime = () => {
            this.time = (new Date().getTime() - this.startTime) / 1000.0;
        };
        this.render = render;
        this.update = update;
        this.state = initialState;
        window_.onresize = this.sizingWithTimeout;
        this.sizing();
        this.startTime = new Date().getTime();
        document_.onkeydown = (ev) => {
            this.applyUpdate({
                kind: "key",
                key: ev.key,
                event: "down"
            });
        };
        document_.onkeyup = (ev) => {
            this.applyUpdate({
                kind: "key",
                key: ev.key,
                event: "up"
            });
        };
    }
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.sizing();
        this.draw();
        this.canvas.onclick = (evt) => {
            const { top, left, right } = this.canvas.getBoundingClientRect();
            const w = right - left;
            const x = evt.clientX - left;
            const y = evt.clientY - top;
            this.applyUpdate({
                kind: "click",
                at: [x / w, y / w]
            });
        };
    }
}
exports.GameService = GameService;
function Game({ render, update, initialState }) {
    const canvasRef = react_1.useRef();
    const gameService = react_1.useRef();
    if (!gameService.current)
        gameService.current = new GameService({
            render,
            initialState,
            update
        });
    react_1.useEffect(() => {
        var _a;
        (_a = gameService.current) === null || _a === void 0 ? void 0 : _a.setCanvas(canvasRef.current);
    }, [canvasRef]);
    return react_1.default.createElement("canvas", { ref: canvasRef });
}
exports.default = Game;
//# sourceMappingURL=Game.js.map