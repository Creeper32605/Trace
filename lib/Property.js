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

import Key from './Key';
class Property {
	constructor() {
		this._p = {
			keys: {}
		}
	}
	get animationType() {
		return 1;
	}
	set animationType(value) {}
	get name() {
		return '--property--';
	}
	set name(value) {}
	get keys() {
		return this._p.keys;
	}
	set keys(value) {
		// todo
	}
	addKey(time, key) {
		if (!(key instanceof Key)) throw new Error('Argument 1 must be a Key');
		if (!Number.isFinite(time) || time < 0) throw new Error('Time must be a positive finite number');
		this._p.keys[+time] = key;
	}
	removeKey(keyOrTime) {
		if (!(keyOrTime instanceof Key) && (!Number.isFinite(keyOrTime) || keyOrTime < 0))
			throw new Error('Argument must be a Key or time');
		if (keyOrTime instanceof Key) {
			for (let k in this._p.keys) {
				if (this._p.keys[k] == keyOrTime) {
					delete this._p.keys[k];
					return true;
				}
			}
		} else {
			if (this._p.keys.hasOwnProperty(keyOrTime)) {
				let key = this._p.keys[keyOrTime];
				delete this._p.keys[keyOrTime];
				return key;
			}
		}
		return false;
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
		return keys[leftBound].value;
	}
}
export default Property;