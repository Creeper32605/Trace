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

import ObjectNode from './ObjectNode';
import Transform from './Transform';
class TransformableNode extends ObjectNode {
	constructor() {
		super();
		this._p.properties.transform = {
			translateX: new Transform.translateX(),
			translateY: new Transform.translateY(),
			scaleX:     new Transform.scaleX(),
			scaleY:     new Transform.scaleY(),
			rotate:     new Transform.rotate(),
			opacity:    new Transform.opacity()
		};
	}
	applyTransformTo(ctx, t) {
		ctx.transform(this.transform.scaleX.atTimeSafe(t), 0, 0, this.transform.scaleY.atTimeSafe(t),
			this.transform.translateX.atTimeSafe(t), this.transform.translateY.atTimeSafe(t));
		ctx.rotate(this.transform.rotate.atTimeSafe(t) % (2 * Math.PI));
		ctx.globalAlpha = this.transform.opacity.atTimeSafe(t);
	}
	transformAtTime(t) {
		return {
			translateX: this.transform.translateX.atTime(t),
			translateY: this.transform.translateY.atTime(t),
			scaleX:     this.transform.scaleX.atTime(t),
			scaleY:     this.transform.scaleY.atTime(t),
			rotate:     this.transform.rotate.atTime(t),
			opacity:    this.transform.opacity.atTime(t)
		};
	}
	get transform() {
		return this._p.properties.transform;
	}
	set transform(value) {
		// TODO: add type checking
		this._p.properties.transform = value;
	}
	draw(ctx, t) {
		this.applyTransformTo(ctx, t);
	}
}
export default TransformableNode;