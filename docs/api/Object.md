# Object
_Not the Javascript `Object`_

A basic object.

## Properties
An `Object` instance has the following properties:

### `transform`
**Default**: 3x3 identity matrix

A [`Transform`](Transform.md) instance.

### `opacity`
**Default**: `1`

An [`AnimatedNumber`](AnimatedNumber.md) instance.

### `enabled`
**Default**: `true`

An [`AnimatedBoolean`](AnimatedBoolean.md) instance.

### `parentNode`
**Default**: `null`

An `Object` or `null`. This variable should not be set manually.

### `children`
**Default**: `new Set()`

Child nodes of this object.

## Methods
### `draw(ctx, parentTransform, currentTime, deltaTime)`
- `ctx` CanvasRenderingContext2D
- `parentTransform` Matrix3
- `currentTime` Number
- `deltaTime` Number

Draws itself and its children.

**Note**: This should be the only method that retrieves the `Transform` property.

### `drawSelf(ctx, transform, currentTime, deltaTime)`
- `ctx` CanvasRenderingContext2D
- `transform` Matrix3
- `currentTime` Number
- `deltaTime` Number
 
### `drawChildren(ctx, transform, currentTime, deltaTime)`
- `ctx` CanvasRenderingContext2D
- `transform` Matrix3 - The matrix the child nodes will receive as `parentTransform`
- `currentTime` Number
- `deltaTime` Number

Sorts children by zIndex and draws them.

**Note**: This should be the only method that retrieves the `zIndex` and `enabled` properties.
