# Easing
## Static Methods
### `[name](t)`
- `t` Number - current time, 0 to 1

Returns `Number`

Insert any of the following for `name`:

- `linear`
- `ease`-`In`/`Out`/`InOut`-
    + `Sine`
    + `Quad`
    + `Cubic`
    + `Quart`
    + `Quint`
    + `Expo`
    + `Circ`
    + `Back`

### `step(t, start = false, count = 1)`
*See above*

- `start` Boolean (optional) - whether the steps should change at the beginning
- `count` Number (optional) - number of steps

Returns `(start ? Math.ceil : Math.floor)(t * count) / count`.

### `cubicBezier(t, x1 = 0, y1 = 0, x2 = 1, y2 = 1)`
*See above*

- `x1` Number (optional) - x coordinate of the first control point
- `y1` Number (optional) - y coordinate of the first control point
- `x2` Number (optional) - x coordinate of the second control point
- `y2` Number (optional) - y coordinate of the second control point

Uses a cubic bezier to interpolate.
