const AnimatedValue = require('./AnimatedValue')

class AnimatedBoolean extends AnimatedValue {
  constructor (defaultValue) {
    super(defaultValue)

    this.interpolator = AnimatedBoolean.interpolator
  }

  static interpolator (currentTime, keys, defaultValue) {
    // find closest keys before and after currentTime
    let closestLeft = -Infinity
    let closestRight = Infinity

    for (let time of keys.keys()) {
      if (time <= currentTime && time > closestLeft) closestLeft = time
      if (time > currentTime && time < closestRight) closestRight = time
    }

    // return default value if no keys are available
    if (!Number.isFinite(closestLeft) && !Number.isFinite(closestRight)) {
      return defaultValue
    }
    // return the right key's value if there are none on the left
    if (!Number.isFinite(closestLeft)) return keys.get(closestRight)[0]
    // return the left key's value
    return keys.get(closestLeft)[0]
  }
}
module.exports = AnimatedBoolean
