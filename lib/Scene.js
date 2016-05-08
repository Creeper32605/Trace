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

import ContainerNode from './ContainerNode';
import NumericKey from './NumericKey';

// A scene
class Scene extends ContainerNode {
	constructor(width, height) {
		super();
		this.width = width;
		this.height = height;
		this._p.currentTime = 0;
		this._p.duration = 0;
		this._p.scaleFactor = 1;
		this._p.bgColor = '';

		this.transform.translateX.addKey(0, new NumericKey(0));
		this.transform.translateY.addKey(0, new NumericKey(0));
		this.transform.scaleX    .addKey(0, new NumericKey(1));
		this.transform.scaleY    .addKey(0, new NumericKey(1));
		this.transform.rotate    .addKey(0, new NumericKey(0));
		this.transform.opacity   .addKey(0, new NumericKey(1));
	}
	get currentTime() {
		return this._p.currentTime;
	}
	set currentTime(value) {
		if (Number.isFinite(value)) this._p.currentTime = value;
	}
	get duration() {
		return this._p.duration;
	}
	set duration(value) {
		if (Number.isFinite(value)) this._p.duration = value;
	}
	get scaleFactor() {
		return this._p.scaleFactor;
	}
	set scaleFactor(value) {
		if (!Number.isFinite(value) || value <= 0)
			throw new Error('scaleFactor must be a positive non-zero finite number');
		this._p.scaleFactor = value;
	}
	get backgroundColor() {
		return this._p.bgColor;
	}
	set backgroundColor(value) {
		this._p.bgColor = value;
	}
	applyTransformTo(ctx, t) {
		this.parent.applyTransformTo(ctx, t);
		ctx.transform(this.scaleFactor, 0, 0, this.scaleFactor, 0, 0);
	}
	drawAt(ctx, t, parent) {
		ctx.fillStyle = this.backgroundColor || 'rgba(0, 0, 0, 0)';
		ctx.clearRect(0, 0, this.width * this.scaleFactor, this.height * this.scaleFactor);
		ctx.fillRect(0, 0, this.width * this.scaleFactor, this.height * this.scaleFactor);
		super.draw(ctx, t, parent);
	}
	draw(ctx, t, parent) {
		this.drawAt(ctx, this.currentTime, parent);
	}
}
export default Scene;