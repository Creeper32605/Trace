/*
 *  This file is part of Trace.
 *
 *  Trace is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Trace is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Trace.  If not, see <http://www.gnu.org/licenses/>.
 */

import Property from './Property';
class AnimatedProperty extends Property {
	constructor() {
		super();
	}
	get animationType() {
		return 2;
	}
	get name() {
		return '--animatedProperty--';
	}
	atTime(t) {
		let keys = this.keys;
		let leftBound = -Infinity;
		let rightBound = Infinity;
		if (keys[t])
			return keys[t].value;
		for (let i in keys) {
			let k = +i;
			if (k < t && k > leftBound) {
				leftBound = k;
			}
			if (k > t && k < rightBound) {
				rightBound = k;
			}
		}
		if (leftBound == -Infinity && rightBound == Infinity) return undefined;
		if (leftBound == -Infinity && rightBound != Infinity)
			return keys[rightBound].value;
		if (rightBound == Infinity && leftBound != -Infinity)
			return keys[leftBound].value;
		let left = keys[leftBound];
		let right = keys[rightBound];
		let interpolated = right.interpolation((t - leftBound) / (rightBound - leftBound));
		return (right.value - left.value) * interpolated + left.value;
	}
}
export default AnimatedProperty;