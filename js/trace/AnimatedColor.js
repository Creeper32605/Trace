const color = require('css-color-converter')
const AnimatedValue = require('./AnimatedValue')
const Easing = require('./Easing')

class AnimatedColor extends AnimatedValue {
  constructor (defaultValue) {
    super(defaultValue)

    this.interpolator = AnimatedColor.interpolator
  }

  static interpolator (currentTime, keys, defaultValue) {
    // find closest keys before and after current time
    let closestLeft = -Infinity
    let closestRight = Infinity

    for (let time of keys.keys()) {
      if (time <= currentTime && time > closestLeft) closestLeft = time
      if (time > currentTime && time < closestRight) closestRight = time
    }

    let left = keys.get(closestLeft)
    let right = keys.get(closestRight)

    // parse colors with failsafe
    let leftColor = color(left) || color([0, 0, 0, 0])
    let rightColor = color(right) || color([0, 0, 0, 0])

    // return default value if no keys are available
    if (!Number.isFinite(closestLeft) && !Number.isFinite(closestRight)) {
      return defaultValue
    }
    // return the right key's value if there are none on the left
    if (!Number.isFinite(closestLeft)) return leftColor.toRgbString()
    // return the left key's value if there are none on the right
    if (!Number.isFinite(closestRight)) return rightColor.toRgbString()

    // interpolate value
    let leftArray = leftColor.toRgbaArray()
    let rightArray = rightColor.toRgbaArray()

    let intervalTime = (currentTime - closestLeft) / (closestRight -
      closestLeft)
    let easingValue = (right[1].function || Easing.linear)(intervalTime,
      ...(right[1].parameters || []))

    let result = [0, 0, 0, 0]
    for (let i in result) {
      result[i] = (rightArray[0] - leftArray[0]) * easingValue + leftArray[0]
    }

    return color(result).toRgbString()
  }
}
module.exports = AnimatedColor
