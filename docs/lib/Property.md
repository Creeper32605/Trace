# Property
This represents any property of an object. When a value at time t is requested, it will return the previous key's value or undefined.

## Properties
### `animationType`
The type of property, in this case `1`.
| 0 | Static: The value mustn't change over time |
| 1 | Hold: Returns the previous key             |
| 2 | Animated: Values are interpolated          |