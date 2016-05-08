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
import TransformableNode from './TransformableNode';

// A container node: can hold other nodes
class ContainerNode extends TransformableNode {
	constructor() {
		super();
		this._p.items = [];
	}
	addItem(item) {
		if (item instanceof ObjectNode) this._p.items.push(item);
		else throw new Error('Item is not an ObjectNode');
	}
	removeItem(item) {
		if (this.items.includes(item)) this._p.items.splice(this.items.indexOf(item));
		else throw new Error('Item not found in Container Node');
	}
	get items() {
		return this._p.items;
	}
	set items(value) {
		if (value instanceof Array) {
			for (let i of value) {
				if (!(i instanceof ObjectNode))
					throw new Error('Array contains items which are not ObjectNodes');
			}
			this._p.items = value;
		} else throw new Error('Value must be an Array');
	}
	draw(ctx, t, parent) {
		super.draw(ctx, t, parent);
		for (let i of this.items) {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.globalAlpha = 1;
			if (parent) parent.applyTransformTo(ctx, t);
			this.applyTransformTo(ctx, t);
			i.draw(ctx, t, this);
		}
	}
}
export default ContainerNode;