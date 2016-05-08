# TransformableNode
##### _Extends ObjectNode_
This is a base class representing an object in the scene with animatable transform, and doesn't do anything on it's own.

## Properties
### `transform`
##### _Object[String, Property]_
Contains the transform properties:
`translateX`
`translateY`
`scaleX`
`scaleY`
`rotate`
`opacity`

## Methods
### `applyTransformTo(ctx, t)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| ctx      | CanvasRenderingContext2D | The canvas to which the transform is to be applied |
| t        | Number | The current time |

Applies the transform in accordance to the properties to a canvas at time t. If any property should be undefined, it'll be set to `0`.

### `transformAtTime(t)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| t        | Number | Time |

Returns the transform object, but instead of properties, their values at time t.

## `draw(ctx, t)`
##### _See ObjectNode: draw(ctx, t)_

Draws the transformed object on the canvas.