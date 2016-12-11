let defaultInterpolator = function (_1, _2, defaultValue) { return defaultValue }

class AnimatedValue {
  constructor (defaultValue) {
    this.defaultValue = defaultValue
    this.keys = new Map()
    this.interpolator = defaultInterpolator
    this.interpolatorSettings = {}
  }

  getValue (currentTime, deltaTime) {
    return AnimatedValue.applyInterpolator(this, currentTime, deltaTime)
  }

  addKey (time, value, easing, parameters) {
    this.keys.set(time, [value, {
      function: easing,
      parameters: parameters
    }])
  }
  removeKey (time) {
    this.keys.delete(time)
  }

  static applyInterpolator (instance, currentTime, deltaTime) {
    return instance.interpolator(currentTime, instance.keys, instance.defaultValue, deltaTime,
      instance.interpolatorSettings)
  }
}
module.exports = AnimatedValue
