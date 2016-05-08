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

import NumericProperty from './NumericProperty';
import NumericKey from './NumericKey';
export default {
	translateX: class PTranslateX extends NumericProperty {
		constructor() { super() }
		get name() { return 'transform.translateX' }
	},
	translateY: class PTranslateY extends NumericProperty {
		constructor() { super() }
		get name() { return 'transform.translateY' }
	},
	scaleX: class PScaleX extends NumericProperty {
		constructor() { super() }
		get name() { return 'transform.scaleX' }
	},
	scaleY: class PScaleY extends NumericProperty {
		constructor() { super() }
		get name() { return 'transform.scaleY' }
	},
	rotate: class PRotate extends NumericProperty {
		constructor() { super() }
		get name() { return 'transform.rotate' }
	},
	opacity: class POpacity extends NumericProperty {
		constructor() { super() }
		get name() { return 'transform.opacity' }
	},
	addDefaultTransforms(obj, t) {
		if (!(obj instanceof TransformableNode)) throw new Error('Object must be a TransformableNode');
		if (!Number.isFinite(t) || t < 0) throw new Error('Time must be a positive finite number');
		obj.transform.translateX.addKey(t, new NumericKey(0));
		obj.transform.translateY.addKey(t, new NumericKey(0));
		obj.transform.scaleX    .addKey(t, new NumericKey(0));
		obj.transform.scaleY    .addKey(t, new NumericKey(0));
		obj.transform.rotate    .addKey(t, new NumericKey(0));
		obj.transform.opacity   .addKey(t, new NumericKey(0));
	}
};