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

import AnimatedProperty from './AnimatedProperty';
import NumericKey from './NumericKey';
class NumericProperty extends AnimatedProperty {
	constructor() {
		super();
	}
	get name() {
		return '--numberProperty--';
	}
	addKey(time, key) {
		if (!(key instanceof NumericKey)) throw new Error('Argument 1 must be a NumericKey');
		super.addKey(time, key);
	}
	addNumericKey(time, value, interpolation) {
		this.addKey(time, new NumericKey(value, interpolation));
	}
	atTimeSafe(t) {
		return this.atTime(t) || 0;
	}
}
export default NumericProperty;