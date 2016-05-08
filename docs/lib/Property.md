# Property
This represents any property of an object. When a value at time t is requested, it will return the previous key's value or undefined.

## Properties
### `animationType`
##### _Number_
The type of property, in this case `1`.

| n | Description                                |
|:-:| ------------------------------------------ |
| 0 | Static: The value mustn't change over time |
| 1 | Hold: Returns the previous key             |
| 2 | Animated: Values are interpolated          |

### `name`
##### _String_
The property's human-readable name.

### `keys`
##### _Array[Key]_
The property's keys.

## Methods
### `addKey(time, key)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| time     | Number | The key's position in time |
| key      | Key  | A key       |

Adds a key at the specified time.

### `removeKey(keyOrTime)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| keyOrTime | Key or Number | The key's position in time or the key itself |

Removes the specified key if it exists.

Returns `true` if success, else `false`.

### `atTime(t)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| t        | Number | Time |

Returns the property's value at the specified time. If no keyframes are present, `undefined`.