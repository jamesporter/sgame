# sgame

A minimalist (web) game development framework. Extracted from a (unreleased) closed source game I've been working on. _Pretty early: seems pretty stable but options limited (e.g. assumes is always fullscreen canvas)_.

Uses [Solandra](https://solandra.netlify.com/) for drawing.

Allows you to quickly make games without bitmap assets (everything is code).

Explicitly separates state updates (handled by the update function) and rendering. Though unlike some functional frameworks that were inspirations isn't pure. You typically mutate stuff directly (but you could easily drop in [immer](https://github.com/immerjs/immer) if that bothers you).

# Example

See [running demo](https://sgame.netlify.com/).

Example code:

```typescript
import React from "react";
import Game from "sgame";
import { State, createInitialState, update, render } from "../ball";

const GamePage = () => (
  <Game<State>
    render={render}
    update={update}
    initialState={createInitialState()}
  />
);
```

Implementation of game in one file, `ball.ts`:

```typescript
import {
  SCanvas,
  Point2D,
  Vector2D,
  v,
  Rect,
  Circle,
  clamp,
  RoundedRect
} from "solandra";
import { Update } from "sgame";

export type State = {
  time: number;
  ballPosition: Point2D;
  ballVelocity: Vector2D;
  paddlePosition: number;
  paddleDirection: -1 | 0 | 1;
  best: number;
  current: number;
};

export function createInitialState(): State {
  return {
    time: 0,
    ballPosition: [0.5, 0.5],
    ballVelocity: v.normalise([0.2, 0.5]),
    paddlePosition: 0.5,
    paddleDirection: 0,
    best: 0,
    current: 0
  };
}

export function update(state: State, update: Update) {
  switch (update.kind) {
    case "time":
      state.time += update.dT;
      state.ballPosition = v.add(
        v.scale(state.ballVelocity, update.dT),
        state.ballPosition
      );

      if (state.ballPosition[0] > 1) {
        state.ballVelocity[0] = -state.ballVelocity[0];
        state.ballPosition[0] = 1;
      }
      if (state.ballPosition[0] < 0) {
        state.ballVelocity[0] = -state.ballVelocity[0];
        state.ballPosition[0] = 0;
      }

      if (state.ballPosition[1] > 1) {
        if (Math.abs(state.ballPosition[0] - state.paddlePosition) < 0.075) {
          state.ballVelocity[1] = -state.ballVelocity[1];
          state.ballPosition[1] = 1;
          state.current++;
          if (state.current > state.best) state.best = state.current;
        } else {
          state.current = 0;
          state.ballPosition = [0.5, 0.5];
          state.ballVelocity = v.normalise([0.2, 0.5]);
        }
      }
      if (state.ballPosition[1] < 0) {
        state.ballVelocity[1] = -state.ballVelocity[1];
        state.ballPosition[1] = 0;
      }

      state.paddlePosition += state.paddleDirection * update.dT * 0.5;
      state.paddlePosition = clamp(
        { from: 0.1, to: 0.9 },
        state.paddlePosition
      );
      break;
    case "key":
      switch (update.key) {
        case "ArrowLeft":
          if (update.event === "down") {
            state.paddleDirection = -1;
          } else {
            state.paddleDirection = 0;
          }
          break;
        case "ArrowRight":
          if (update.event === "down") {
            state.paddleDirection = 1;
          } else {
            state.paddleDirection = 0;
          }
          break;
      }
  }
}

export function render(s: SCanvas, state: State) {
  const { bottom, center } = s.meta;
  const minD = Math.min(bottom, 1);
  const w = minD * 0.8;
  const h = minD * 0.8;
  const sX = (1 - w) / 2;
  const sY = (bottom - h) / 2;

  s.background(state.current * 5, 90, 20);

  s.setFillColor(state.current * 5, 80, 15);
  s.fill(
    new Rect({
      at: [sX, sY],
      w,
      h
    })
  );

  s.setFillColor(state.current * 5, 90, 30);
  s.fillText(
    {
      at: center,
      align: "center",
      size: 0.05
    },
    `${state.current} (Best: ${state.best})`
  );

  s.setFillColor(0, 0, 95);
  s.fill(
    new Circle({
      at: v.add([sX, sY], v.scale(state.ballPosition, w)),
      r: 0.02 * w
    })
  );

  s.fill(
    new RoundedRect({
      align: "center",
      at: [sX + w * state.paddlePosition, sY + h],
      w: 0.15 * w,
      h: 0.01 * w,
      r: 0.005
    })
  );
}
```
