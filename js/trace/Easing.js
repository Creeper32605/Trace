const BezierEasing = require('bezier-easing')

class Easing {
  constructor () {
    throw new Error('Invalid')
  }

  static linear (t) {
    return t
  }

  static easeInSine (t) {
    return Math.sin((Math.PI * t - Math.PI) / 2) + 1
  }
  static easeOutSine (t) {
    return Math.sin((Math.PI * t) / 2)
  }
  static easeInOutSine (t) {
    return Math.sin(Math.PI * t - (Math.PI / 2)) / 2 + 0.5
  }

  static easeInQuad (t) {
    return t * t
  }
  static easeOutQuad (t) {
    return t * (2 - t)
  }
  static easeInOutQuad (t) {
    return t < 0.5 ? (2 * t * t) : (-1 + (4 - 2 * t) * t)
  }

  static easeInCubic (t) {
    return t * t * t
  }
  static easeOutCubic (t) {
    return (--t) * t * t + 1
  }
  static easeInOutCubic (t) {
    return t < 0.5 ? (4 * t * t * t) : ((t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
  }

  static easeInQuart (t) {
    return t * t * t * t
  }
  static easeOutQuart (t) {
    return 1 - (--t) * t * t * t
  }
  static easeInOutQuart (t) {
    return t < 0.5 ? (8 * t * t * t * t) : (1 - 8 * (--t) * t * t * t)
  }

  static easeInQuint (t) {
    return t * t * t * t * t
  }
  static easeOutQuint (t) {
    return 1 + (--t) * t * t * t * t
  }
  static easeInOutQuint (t) {
    return t < 0.5 ? (16 * t * t * t * t * t) : (1 + 16 * (--t) * t * t * t * t)
  }

  static easeInExpo (t) {
    return Math.pow(2, 10 * (t - 1))
  }
  static easeOutExpo (t) {
    return 1 - Math.pow(2, -10 * t)
  }
  static easeInOutExpo (t) {
    return t < 0.5 ? (Math.pow(2, 10 * (2 * t - 1)) / 2) : (1 - Math.pow(2, -10 * (2 * t - 1)) / 2)
  }

  static easeInCirc (t) {
    return -Math.sqrt(1 - t * t) + 1
  }
  static easeOutCirc (t) {
    return Math.sqrt(1 - (--t) * t)
  }
  static easeInOutCirc (t) {
    return t < 0.5 ? (0.5 * (Math.sqrt(1 - (4 * t * t)) - 1))
      : (0.5 * (Math.sqrt(1 - (2 * t - 2) * (2 * t - 2)) + 1))
  }

  static step (t, start = false, count = 1) {
    return (start ? Math.ceil : Math.floor)(t * count) / count
  }

  static cubicBezier (t, x1 = 0, y1 = 0, x2 = 1, y2 = 1) {
    return BezierEasing(x1, y1, x2, y2)(t)
  }
}
module.exports = Easing
