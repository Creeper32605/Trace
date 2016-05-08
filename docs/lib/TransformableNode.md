# TransformableNode
##### _extends ObjectNode_
This is a base class representing an object in the scene with animatable transform, and doesn't do anything on it's own.

## Properties
### `transform`
##### _Object_
Contains the transform properties:
`translateX`
`translateY`
`scaleX`
`scaleY`
`rotate`
`opacity`

## Methods
### `applyTransformTo(ctx, t)`
Applies the transform in accordance to the properties to a canvas at time t. If any property should be undefined, it'll be set to `0`.

### `transformAtTime(t)`
Returns the transform object, but instead of properties, their values at time t.

## `draw(ctx, t)`
Draws the transformed object on the canvas.