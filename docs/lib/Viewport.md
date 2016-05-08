# Viewport
This is a wrapper for scenes that draws them centered on canvases and provides timeline controls.

## Properties
### `canvas`
##### _HTMLCanvasElement_

The canvas on which the scene is to be drawn. Can be set to a `CanvasRenderingContext2D` as well.

### `scene`
##### _Scene_

The scene which will be drawn.

### `playing`
##### _boolean_

Indicates whether the animation is playing.

### `playbackRate`
##### _Number_

The rate at which the animation should be played, can be negative.

### `loop`
##### _boolean_

When set to true, the animation will jump to the beginning when the end is reached.

### `currentTime`
##### _Number_

The scene's `currentTime`.

### `duration`
##### _Number_

The scene's `duration`.

### `stops`
##### _Array[Array[Number]]_

Stops on the timeline at which the playback will either be stopped or repeated. See _addStop(time, type)_

### `ignoreRepeater`
##### _boolean_

When set to true, the next repeater will be ignored. See `addStop(time, type)`

## Methods
### `on(evt, fn)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| evt      | String | The event |
| fn       | Function | The event listener |

Add an event listener for one of the following events:

|      Event     |               Description               |
| -------------- | --------------------------------------- |
| `play`         | Fired when the animation starts playing |
| `pause`        | Fired when the animation stops playing  |
| `stop`         | Fired when a stop is reached            |
| `end`          | Fired when the animation ends*          |
| `timeupdate`   | Fired when the time is updated          |
| `scenechange`  | Fired when the scene is changed         |
| `canvaschange` | Fired when the canvas is changed        |
| `resize`       | Fired when a resize event is passed*    |
_*The event will only fire when it stops playing at the end of the scene, i.e. it won't fire when `loop` is true_

_**See `resized()`_

### `off(evt, fn)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| evt      | String | The event |
| fn       | Function | The event listener |

Removes an event listener

### `dispatchEvent(evt)`
_(Internal function, do not use unless with good reason)_

| Argument | Type | Description |
| -------- | ---- | ----------- |
| evt      | String | The event |

Triggers an event, i.e. all event listeners for that event.

### `resized()`

Should be called when the canvas is resized.

### `addStop(time, type)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| time     | Number | The time |
| type     | Number (optional) | The type |

Adds a stop at the specified time of type `0` if no type argument is passed.

| Type | Description |
|:----:| ----------- |
| 0    | Playback will stop at this stop |
| 1    | A repeater, playback will repeat from the last stop to this one |
| 2    | A marker, does nothing on it's own, useful with repeaters |

### `removeStop(time)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| time     | Number | The time |

Removes a stop at the specified time if it exists.

Returns `true` if success, else `false`.

### `ignoreNextIfRepeater()`

Sets the `ignoreRepeater` flag to `true` if the next stop is a repeater.

### `playLoop()`
_(Internal function, do not use unless with good reason)_

Is called every frame during playback

### `play()`

Starts playing the animation.

### `pause()`

Pauses playback.

### `applyTransformTo(ctx, t)`
_(Internal function, do not use unless with good reason)_
Applies the transform to the canvas, for centering the scene.

### `draw(_, t)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| t        | Number (optional) | Time      |

Draws the Viewport at time t if specified, else the scene's `currentTime`.