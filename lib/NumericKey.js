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
class NumericKey extends Key {
	constructor(value, interpolation) {
		super(value, interpolation);
	}
	get value() {
		return this._p.value;
	}
	set value(value) {
		if (!Number.isFinite(value)) throw new Error('Value must be a finite number');
		super.value = value;
	}
}
export default NumericKey;