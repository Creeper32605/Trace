# Viewport
Scales everything to fit a canvas.

## Properties
### `width`, `height`
**Default**: `960`, `540`

The content width and height.

### `canvasWidth`, `canvasHeight`
**Default**: `960`, `540`

The (unscaled) canvas width and height.

### `canvasScale`
**Default**: `1`

Everything (including `canvasWidth` and `canvasHeight`) will be scaled with this factor. Should be set to `window.devicePixelRatio`.

### `contentSize`
**Default**: `'contain'`

- `contain`: scales content as large as possible but still within the canvas
- `cover`: scales content to fill the canvas

### `backgroundColor`
**Default**: `''`

The color with which the content area will be filled, if specified.

### `marginColor`
**Default**: `''`

The color with which the margin area will be filled, if specified. Note that this will not overlap with the background color.

## Methods
### `getContentPos`
Returns an object:

- `x` Number - content position x
- `y` Number - content position y
- `scale` Number - content scale

Note that the `canvasScale` hasn't been applied.

### `drawMargin(ctx, transform, currentTime, deltaTime)`
 `ctx` CanvasRenderingContext2D
- `transform` Matrix3
- `currentTime` Number
- `deltaTime` Number

Clears the margins and fills it with the margin color.
