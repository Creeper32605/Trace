# Transform
Represents an object's transform.

## Properties
- `translateX`
- `translateY`
- `translateZ`
- `rotateX`
- `rotateY`
- `rotateZ`
- `skewX`
- `skewY`
- `skewZ`
- `scaleX`
- `scaleY`
- `scaleZ`

All propeties are instances of [`AnimatedNumber`](AnimatedNumber.md) and have a default value of `0`, except for `scaleX/Y/Z` which have a default value of `1`.

The `translateZ`, `rotateX/Y`, `skewZ` and `scaleZ` properties are useless when used for an [`Object`](Object.md)'s `transform`.

## Methods
### `getMatrix(currentTime, deltaTime)`
- `currentTime` Number
- `deltaTime` Number

Returns a 2D transformation matrix for the given time.
