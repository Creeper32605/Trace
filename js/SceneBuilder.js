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

// import all the things
import _libAnimatedProperty from 'lib/AnimatedProperty';
import _libContainerNode from 'lib/ContainerNode';
import _libEasing from 'lib/Easing';
import _libHoldProperty from 'lib/HoldProperty';
import _libKey from 'lib/Key';
import _libNumericKey from 'lib/NumericKey';
import _libNumericProperty from 'lib/NumericProperty';
import _libObjectNode from 'lib/ObjectNode';
import _libProperty from 'lib/Property';
import _libScene from 'lib/Scene';
import _libStaticProperty from 'lib/StaticProperty';
import _libTransform from 'lib/Transform';
import _libTransformableNode from 'lib/TransformableNode';
import _libViewport from 'lib/Viewport';

export default {
	build: function(__defs, __data, viewport) {
		viewport.pause();
		let scene = new _libScene(__data.width, __data.height);
		scene.duration = __data.duration;
		viewport.stops = __data.stops;
		viewport.loop = __data.loop;
		viewport.scene = scene;

		// this is for some reason mandatory
		let AnimatedProperty  = _libAnimatedProperty;
		let ContainerNode     = _libContainerNode;
		let Easing            = _libEasing;
		let HoldProperty      = _libHoldProperty;
		let Key               = _libKey;
		let NumericKey        = _libNumericKey;
		let NumericProperty   = _libNumericProperty;
		let ObjectNode        = _libObjectNode;
		let Property          = _libProperty;
		let Scene             = _libScene;
		let StaticProperty    = _libStaticProperty;
		let Transform         = _libTransform;
		let TransformableNode = _libTransformableNode;
		let Viewport          = _libViewport;

		// it's the user's fault if they cause the apocalypse
		let exports = {};
		eval(__defs);
		let data = __data;
		let nodes = {};
		for (let i of data.nodes) {
			try {
				let node = eval(`new exports.${i.class}()`);
				if (nodes.hasOwnProperty(i.id)) throw new Error('Node with ID ${data.id} already exists');
				nodes[i.id] = [node, i.parent];
				for (let p of i.properties) {
					let property = eval(`node.${p.name}`);
					for (let k of p.keys) {
						try {
							let val = k.value;
							if (val.match(/^\d+(\.\d+)?$/)) val = parseFloat(val);
							let key = eval(`new ${k.class}(${val}, ${k.easing || 'undefined'})`);
							let time = k.time;
							if (time.match(/^\d+(\.\d+)?$/)) time = parseFloat(time);
							property.addKey(time, key);
						} catch(err) {
							console.log(err);
						}
					}
				}
			} catch(err) {
				console.error(err);
			}
		}
		// add nodes to their parents
		for (let k in nodes) {
			let i = nodes[k];
			if (i[1] != 0 && nodes.hasOwnProperty(i[1])) {
				try {
					nodes[i[1]].addItem(i[0]);
				} catch(err) {
					console.error(err);
				}
			} else {
				scene.addItem(i[0]);
			}
		}
	}
};