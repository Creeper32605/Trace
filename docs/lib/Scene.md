# Scene
##### _Extends ContainerNode_
This is a scene with width, height and simple time control.

Note: Object transforms do not apply

## Properties
##### _See ContainerNode: Properties_
### `currentTime`
##### _Number_
The current time of the scene.

### `duration`
##### _Number_
The duration of the scene.

### `scaleFactor`
##### _Number_
The scale factor of the scene, used for high dpi screens.

### `backgroundColor`
##### _String_
The scene's background color, if any.

## Methods
##### _See ContainerNode: Methods_
### `applyTransformTo(ctx, t)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| ctx      | CanvasRenderingContext2D | A canvas |
| t        | Number | Time – doesn't do anything here |

Applies _only_ the scale factor to a canvas.

### `drawAt(ctx, t, parent)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| ctx      | CanvasRenderingContext2D | A canvas |
| t        | Number | Time |
| parent   | Any | The parent node (e.g. Viewport) |

Draws the scene on the specified canvas at time t.

### `draw(ctx, t, parent)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| ctx      | CanvasRenderingContext2D | A canvas |
| t        | Time - doesn't do anything here |
| parent   | Any | The parent node (e.g. Viewport) |

Draws the scene on the specified canvas at the `currentTime`.