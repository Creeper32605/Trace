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

import Easing from './Easing';
class Key {
	constructor(value, interpolation) {
		this._p = {
			value: undefined,
			interpolation: Easing.easeInOutCubic
		};
		if (value !== undefined)
			this.value = value;
		if (interpolation !== undefined)
			this.interpolation = interpolation;
	}
	get value() {
		return this._p.value;
	}
	set value(value) {
		this._p.value = value;
	}
	get interpolation() {
		return this._p.interpolation;
	}
	set interpolation(value) {
		if (typeof value != 'function') throw new Error('Interpolation function must be a function');
		// quick test to check if it returns a number
		if (!Number.isFinite(value(0))) throw new Error('Interpolation function must return a finite number');
		this._p.interpolation = value;
	}
}
export default Key;