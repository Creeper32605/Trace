# NumericProperty
##### _Extends AnimatedProperty_
A numeric property with interpolation.

## Properties
##### _See AnimatedProperty: Properties_

## Methods
##### _See AnimatedProperty: Methods_

### `addKey(time, key)`
##### _See AnimatedProperty: addKey(time, key)_
| Argument | Type | Description |
| -------- | ---- | ----------- |
| time     | Number | The key's position in time |
| key      | NumericKey | A numeric key |

Adds a key at the specified time.

### `addNumericKey(time, value, interpolation)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| time     | Number | The key's position in time |
| value    | Number | The key's value |
| interpolation | Function (optional) | The key's interpolation |

Adds a new numeric key at the specified time.

### `atTimeSafe(t)`
##### _See AnimatedProperty: atTime(t)_
Returns the value of `atTime(t)` or `0` if no keys are present.