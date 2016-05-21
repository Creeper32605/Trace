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

import * as BinaryTools from 'BinaryTools.js';
import jDataView from 'jDataView.js';

let padString = function(str, length, pre, post) {
	str = str + '';
	length = +length;
	if (!length || (!pre && !post))
		return str;
	let required = length - str.length;
	if (required <= 0)
		return str;
	let center = pre && post;
	let p = '';
	let s = '';
	if (center) {
		var pos = Math.floor((length - str.length) * 0.5);
		p = (new Array(1 + pos)).join(pre);
		s = (new Array(1 + length - pos - str.length)).join(post);
	} else if (pre) {
		p = (new Array(1 + length - str.length)).join(pre);
	} else if (post) {
		s = (new Array(1 + length - str.length)).join(post);
	}
	let res = p + str + s;
	if (res.length != length) {
		throw new Error(`Error padding string, expected length: ${length}, outcome: ${res.length} (${res})`);
	}
	return res;
};

export default {
	readFile: function(fileString) {
		// get binary part
		let regtemp = /\/\* \+-\[\s+(\d+.\d+)\s+\]\-=<([\|\-\+]{28})>=-{18}\+ \*\\([\s\S]*)\\\* \+-{18}=<([\|\-\+]{28})>=-{18}\+ \*\//;
		let regex = new RegExp(regtemp, 'ig');
		let e = fileString.match(regex);
		regex = new RegExp(regtemp, 'i');
		let version = 0.0;
		let bin = '';
		if (e) {
			for (let i of e) {
				let matches = i.match(regex);
				if (matches && matches[2] == '|-++---+-|-++-+--+|-++-+++-|' &&
					matches[4] == '|-++--+-+|-++-+++-|-++--+--|') {
					version = parseFloat(matches[1]);
					bin = matches[3];
					break;
				}
			}
		}
		if (bin) {
			// remove binary section
			let binPos = fileString.indexOf(bin);
			fileString = fileString.substr(0, binPos - 76) + fileString.substr(binPos + bin.length + 76);
			bin = atob(bin.replace(/\n/g, ''));
		}
		// remove redundant newlines at file end
		fileString = fileString.replace(/\n+$/, '\n');
		return [fileString, version, bin];
	},
	binToJSON: function(bin, version) {
		if (!bin) return {};
		if (version !== 1) throw new Error('Versions other than 1.0 not supported');
		let dv = new jDataView(bin);
		let data = BinaryTools.reader([
			{
				type: 'lstr',
				length: 1,
				name: 'name',
				encoding: 'utf-8'
			},
			{
				type: 'uint',
				length: 2,
				name: 'width'
			},
			{
				type: 'uint',
				length: 2,
				name: 'height'
			},
			{
				type: 'uint',
				length: 4,
				name: 'duration'
			},
			{
				type: 'uint',
				length: 1,
				name: 'loop'
			},
			{
				type: 'lstr',
				length: 4,
				name: 'stops'
			},
			{
				type: 'remaining',
				name: 'rest'
			}
		], dv);

		let stops = [];
		let nodes = [];

		let spos = 0;
		let stopsdv = new jDataView(data.stops);
		while (spos < stopsdv.byteLength) {
			let stop = BinaryTools.reader([
				{
					type: 'uint',
					length: 4,
					name: 'pos'
				},
				{
					type: 'uint',
					length: 1,
					name: 'type'
				}
			], stopsdv);
			stops.push([stop.pos, stop.type]);
			spos += stop._length;
		}

		let pos = 0;
		let nodesdv = new jDataView(data.rest);
		while(pos < nodesdv.byteLength) {
			let node = BinaryTools.reader([
				{
					type: 'uint',
					length: 2,
					name: 'id'
				},
				{
					type: 'lstr',
					length: 1,
					name: 'class',
					encoding: 'utf-8'
				},
				{
					type: 'uint',
					length: 2,
					name: 'parent'
				},
				{
					type: 'lstr',
					length: 4,
					name: 'properties'
				}
			], nodesdv, pos);
			let onode = {
				id: node.id,
				class: node.class,
				parent: node.parent,
				properties: []
			};
			let propsdv = new jDataView(node.properties);
			let ppos = 0;
			while(ppos < propsdv.byteLength) {
				let prop = BinaryTools.reader([
					{
						type: 'lstr',
						length: 2,
						name: 'name',
						encoding: 'utf-8'
					},
					{
						type: 'lstr',
						length: 4,
						name: 'keys',
						encoding: 'utf-8'
					}
				], propsdv, ppos);
				let oprop = {
					name: prop.name,
					keys: []
				};
				let keysdv = new jDataView(prop.keys);
				let kpos = 0;
				while (kpos < keysdv.byteLength) {
					let key = BinaryTools.reader([
						{
							type: 'lstr',
							length: 1,
							name: 'class',
							encoding: 'utf-8'
						},
						{
							type: 'lstr',
							length: 4,
							name: 'time',
							encoding: 'utf-8'
						},
						{
							type: 'lstr',
							length: 4,
							name: 'value',
							encoding: 'utf-8'
						},
						{
							type: 'lstr',
							length: 1,
							name: 'easing',
							encoding: 'utf-8'
						}
					], keysdv, kpos);
					oprop.keys.push(key);
					kpos += key._length;
				}
				onode.properties.push(oprop);
				ppos += prop._length;
			}
			nodes.push(onode);
			pos += node._length;
		}
		return {
			name: data.name,
			width: data.width,
			height: data.height,
			duration: data.duration,
			loop: data.loop == 1,
			nodes: nodes,
			stops: stops
		};
	},
	JSONToBin: function(data) {
		let recipe = [];
		let rdata = [];
		recipe.push({
			type: 'lstr',
			length: 1,
			encoding: 'utf-8'
		},
		{
			type: 'uint',
			length: 2
		},
		{
			type: 'uint',
			length: 2
		},
		{
			type: 'uint',
			length: 4
		},
		{
			type: 'uint',
			length: 1
		});
		rdata.push(data.name, data.width, data.height, data.duration, data.loop == true ? 1 : 0);
		let stops, stopsLength;
		{
			let srecipe = [];
			let sdata = [];
			for (let stop of data.stops) {
				srecipe.push({
					type: 'uint',
					length: 4
				}, {
					type: 'uint',
					length: 1
				});
				sdata.push(stop[0], stop[1]);
			}
			stops = BinaryTools.builder(srecipe, sdata);
			stops = stops.getString(stops.byteLength, 0, 'utf-8');
		}
		recipe.push({
			type: 'lstr',
			length: 4
		});
		rdata.push(stops);
		{
			for (let node of data.nodes) {
				recipe.push({
					type: 'uint',
					length: 2
				}, {
					type: 'lstr',
					length: 1
				}, {
					type: 'uint',
					length: 2
				}, {
					type: 'lstr',
					length: 4
				});
				rdata.push(node.id, node.class, node.parent);
				let props = '';
				for (let prop of node.properties) {
					let precipe = [{
						type: 'lstr',
						length: 2
					}, {
						type: 'lstr',
						length: 4
					}];
					let pdata = [prop.name];
					let keys = '';
					for (let key of prop.keys) {
						let str = BinaryTools.builder([
							{
								type: 'lstr',
								length: 1
							},
							{
								type: 'lstr',
								length: 4
							},
							{
								type: 'lstr',
								length: 4
							},
							{
								type: 'lstr',
								length: 1
							}
						], [key.class.toString(), key.time.toString(),
							key.value.toString(), key.easing.toString()]);
						keys += str.getString(str.byteLength, 0);
					}
					pdata.push(keys);
					let str = BinaryTools.builder(precipe, pdata);
					props += str.getString(str.byteLength, 0);
				}
				rdata.push(props);
			}
		}
		let bin = BinaryTools.builder(recipe, rdata);
		return bin.getString(bin.byteLength, 0);
	},
	writeFile: function(js, bin) {
		let fileString = js;
		let version = padString('1.0', 14, ' ', ' ');
		let top = `/* +-[${version}]-=<|-++---+-|-++-+--+|-++-+++-|>=------------------+ *\\`;
		let bottom = `\\* +------------------=<|-++--+-+|-++-+++-|-++--+--|>=------------------+ */`;
		let xbin = btoa(bin).match(/.{1,76}/g).join('\n');
		return `${js}\n${top}\n${xbin}\n${bottom}`;
	}
}