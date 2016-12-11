# AnimatedNumber
**extends [`AnimatedValue`](AnimatedValue.md)**

An animated number.

## Properties
### `interpolator`
Default: `AnimatedNumber.interpolator`

## Static Methods
### `interpolator(currentTime, keys, defaultValue)`
Returns `Number`.

Uses the easing functions of the next key in `keys` to interpolate from the previous to the next key.

### `springInterpolator(currentTime, keys, defaultValue, deltaTime, interpolatorSettings)`
Returns `Number`.

Requires `interpolatorSettings` to have a property called `spring` containing `[force, deceleration]`.

Applies `velocity = (velocity + ((targetValue - currentValue) * force * deltaTime)) * (1 / (1 + deceleration * deltaTime))` every frame.
