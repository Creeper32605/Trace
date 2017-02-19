# Trace
![Screenshot of example on macOS with timeline and title bar visible](https://i.imgur.com/RXFkOiY.png)

Plays animations, usually using [`trace-api`](https://github.com/cpsdqs/trace-api).

## Usage
Drop a file or a folder into the window. It should be [`require`](https://nodejs.org/api/modules.html)-able and export the following object:
```javascript
{
  title: String, // title
  Main: class, // main class constructor
  timeline: Boolean // will enable timeline controls if true
}
```

The main class constructor will receive a single argument: an [`EventEmitter`](https://nodejs.org/api/events.html) with properties `ctx`, `width`, `height`, `scale` and a `resize` event. The width and height are the actual canvas size on the screen (i.e. in CSS pixels) and the scale is the [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio).

When `timeline` is true, the main class will be treated like a [`Timeline`](https://github.com/cpsdqs/trace-api/blob/master/docs/api/timeline.md) instance.
