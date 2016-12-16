# AnimatedColor
**extends [`AnimatedValue`](AnimatedValue.md)**

An animated color.

## Properties
### `interpolator`
Default: `AnimatedColor.interpolator`

## Static Methods
### `interpolator(currentTime, keys, defaultValue)`
Returns `String`: formatted as `rgb(r, g, b)` or `rgba(r, g, b, a)`

Uses the easing functions of the next key in `keys` to interpolate from the previous to the next key.
