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

import Controls from 'js/Controls';
import Easing from 'lib/Easing';
import Scene from 'lib/Scene';
import Viewport from 'lib/Viewport';
import TransformableNode from 'lib/TransformableNode';
import NumericProperty from 'lib/NumericProperty';
import NumericKey from 'lib/NumericKey';
import Transform from 'lib/Transform';
import ContainerNode from 'lib/ContainerNode';

let app        = document.querySelector('#app');
let mainCanvas = document.querySelector('#main-canvas');
let controlsEl = document.querySelector('#controls');
let ctrlCanvas = document.querySelector('#controls-canvas');
let popupEl    = document.querySelector('#popup-preview');
let ppupCanvas = document.querySelector('#popup-canvas');
let popupTime  = document.querySelector('#popup-time');

let dp = 1;
let ctw = 0;
let cth = 0;

let viewport = {
	play: function() {},
	pause: function() {},
	resized: function() {},
	draw: function() {},
	currentTime: 0,
	duration: 0,
	stops: []
};
let controls = {
	draw: function() {}
};

let resizeCanvases = function() {
	dp = devicePixelRatio;
	let csm = getComputedStyle(mainCanvas);
	mainCanvas.width =  parseInt(csm.width) * dp;
	mainCanvas.height = parseInt(csm.height) * dp;
	let csc = getComputedStyle(ctrlCanvas);
	ctrlCanvas.width =  parseInt(csc.width) * dp;
	ctrlCanvas.height = parseInt(csc.height) * dp;
	ctw = parseInt(csc.width);
	cth = parseInt(csc.height);
	viewport.resized();
	controls.draw();
};
resizeCanvases();
window.onresize = resizeCanvases;

controls = new Controls(controlsEl, ctrlCanvas, app, popupEl, ppupCanvas, popupTime);

if ('xipc' in window) {
	xipc.on('fullscreen-notifier', function(e, state) {
		controls.setFullscreenButton(state == 'true' ? 1 : 0);
	});
}

{
	let LineNode = class LineNode extends TransformableNode {
		constructor() {
			super();
			this.x1 = new NumericProperty();
			this.y1 = new NumericProperty();
			this.x2 = new NumericProperty();
			this.y2 = new NumericProperty();
		}
		draw(ctx, t) {
			super.draw(ctx, t);
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 3;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(this.x1.atTimeSafe(t), this.y1.atTimeSafe(t));
			ctx.lineTo(this.x2.atTimeSafe(t), this.y2.atTimeSafe(t));
			ctx.stroke();
		}
	};
	let ArcNode = class ArcNode extends TransformableNode {
		constructor() {
			super();
			this.x = new NumericProperty();
			this.y = new NumericProperty();
			this.rad = new NumericProperty();
			this.start = new NumericProperty();
			this.end = new NumericProperty();
		}
		draw(ctx, t) {
			super.draw(ctx, t);
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 3;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.arc(this.x.atTimeSafe(t), this.y.atTimeSafe(t), this.rad.atTimeSafe(t),
				this.start.atTimeSafe(t), this.end.atTimeSafe(t));
			ctx.stroke();
		}
	};
	let DropArea = class DropArea extends TransformableNode {
		constructor() {
			super();
			this.dropping = false;
			this.dropastart = Date.now();
			this.dropaend = Date.now();
		}
		draw(ctx, t) {
			super.draw(ctx, t);
			ctx.fillStyle = '#fff';
			ctx.strokeStyle = '#fff';
			ctx.lineCap = 'butt';
			ctx.lineJoin = 'round';
			let r = 5;
			let w, h;
			let a = this.dropastart, b = this.dropaend, c = Date.now();
			// animation progress
			let anpr = c > b ? 1 : (c < a ? 0 : (c - a) / (b - a));
			// whether it is animating
			let anim = anpr >= 1 ? false : true;
			let eased = anim ? Easing.easeOutExpo(anpr) : anpr;

			if (anim && this.dropping) { w = 250 + eased * 50; h = 140 + eased * 60; }
			else if (anim && !this.dropping) { w = 300 - eased * 50; h = 200 - eased * 60; }
			else if (!this.dropping) { w = 250; h = 140; }
			else { w = 300; h = 200; }

			ctx.beginPath();
			ctx.moveTo(-w, -h + 2 * r);
			ctx.arcTo( -w, -h, -w + r,     -h, 2 * r);
			ctx.arcTo(  w, -h,      w, -h + r, 2 * r);
			ctx.arcTo(  w,  h,  w - r,      h, 2 * r);
			ctx.arcTo( -w,  h,     -w,  h - r, 2 * r);
			ctx.closePath();
			ctx.stroke();
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			let fsize;
			if (anim && this.dropping) fsize = 48 + eased * 10;
			else if (anim && !this.dropping) fsize = 58 - eased * 10;
			else if (!this.dropping) fsize = 48;
			else fsize = 58;
			ctx.font = `500 ${fsize}px Avenir Next, Montserrat, Lato, Helvetica, sans-serif`;
			ctx.fillText('Drop JS File Here', 0, 0);
		}
	}
	let letters = {
		t: {
			top: new LineNode(),
			stem: new LineNode()
		},
		r: {
			left: new LineNode(),
			top: new LineNode(),
			arc: new ArcNode(),
			middle: new LineNode(),
			leg: new LineNode()
		},
		a: {
			left: new LineNode(),
			right: new LineNode(),
			middle: new LineNode()
		},
		c: {
			arc: new ArcNode()
		},
		e: {
			left: new LineNode(),
			top: new LineNode(),
			middle: new LineNode(),
			bottom: new LineNode()
		}
	};
	let addPos = function(obj, n, t, x, y) {
		obj[`x${n}`].addNumericKey(t, x, Easing.easeOutExpo);
		obj[`y${n}`].addNumericKey(t, y, Easing.easeOutExpo);
	};
	let addPPos = function(obj, n, ...positions) {
		let pos = [];
		for (let i of positions) {
			pos.push(i);
			if (pos.length == 3) {
				addPos(obj, n, pos[0], pos[1], pos[2]);
				pos = [];
			}
		}
	}
	let addArcPos = function(obj, t, x, y, r, s, e, f) {
		if(x !== undefined) obj.x    .addNumericKey(t, x, f || Easing.easeOutExpo);
		if(y !== undefined) obj.y    .addNumericKey(t, y, f || Easing.easeOutExpo);
		if(r !== undefined) obj.rad  .addNumericKey(t, r, f || Easing.easeOutExpo);
		if(s !== undefined) obj.start.addNumericKey(t, s, f || Easing.easeOutExpo);
		if(e !== undefined) obj.end  .addNumericKey(t, e, f || Easing.easeOutExpo);
	};
	// T
	Transform.addDefaultTransforms(letters.t.top, 0);
	Transform.addDefaultTransforms(letters.t.stem, 0);
	addPPos(letters.t.top,  1, 0, 8, 12, .5,  0, 12, 1,  0,  0);
	addPPos(letters.t.top,  2, 0, 8, 12, .5, 16, 12, 1, 16,  0);
	addPPos(letters.t.stem, 1, 0, 8, 12, .5,  8, 12, 1,  8,  0);
	addPPos(letters.t.stem, 2, 0, 8, 12, .5,  8, 12, 1,  8, 24);
	// R
	Transform.addDefaultTransforms(letters.r.left, 0);
	Transform.addDefaultTransforms(letters.r.top, 0);
	Transform.addDefaultTransforms(letters.r.arc, 0);
	Transform.addDefaultTransforms(letters.r.middle, 0);
	Transform.addDefaultTransforms(letters.r.leg, 0);
	addArcPos(letters.r.arc, .2, 29,  7, 7, Math.PI / 2, Math.PI / 2);
	addArcPos(letters.r.arc, .5, 29,  7, 7, -Math.PI / 2, Math.PI / 2, Easing.easeOutCubic);
	addPPos(letters.r.left,   1,  0, 22, 14, .4, 22,  8);
	addPPos(letters.r.left,   2,  0, 22, 14, .4, 22, 24);
	addPPos(letters.r.top,    1, .4, 29,  0,  1, 22,  0);
	addPPos(letters.r.top,    2, .4, 29,  0,  1, 29,  0);
	addPPos(letters.r.middle, 1, .1, 22, 14, .5, 22, 14);
	addPPos(letters.r.middle, 2, .1, 22, 14, .5, 29, 14);
	addPPos(letters.r.leg,    1, .5, 30, 14,  1, 30, 14);
	addPPos(letters.r.leg,    2, .5, 30, 14,  1, 36, 24);
	// A
	Transform.addDefaultTransforms(letters.a.left, 0);
	Transform.addDefaultTransforms(letters.a.right, 0);
	Transform.addDefaultTransforms(letters.a.middle, 0);
	addPPos(letters.a.left,   1, 0, 48, 12, .5, 48,  0, 1, 48,  0);
	addPPos(letters.a.left,   2, 0, 48, 12, .5, 48, 24, 1, 40, 24);
	addPPos(letters.a.right,  1, 0, 48, 12, .5, 48,  0, 1, 48,  0);
	addPPos(letters.a.right,  2, 0, 48, 12, .5, 48, 24, 1, 56, 24);
	addPPos(letters.a.middle, 1, .5, 48, 13, 1, 43, 16);
	addPPos(letters.a.middle, 2, .5, 48, 13, 1, 53, 16);
	// C
	Transform.addDefaultTransforms(letters.c.arc, 0);
	addArcPos(letters.c.arc, 0, 72, 12, 12, Math.PI / 2, Math.PI / 2);
	addArcPos(letters.c.arc, 1, 72, 12, 12, Math.PI / 2, 1.5 * Math.PI);
	// E
	Transform.addDefaultTransforms(letters.e.left, 0);
	Transform.addDefaultTransforms(letters.e.top, 0);
	Transform.addDefaultTransforms(letters.e.middle, 0);
	Transform.addDefaultTransforms(letters.e.bottom, 0);
	addPPos(letters.e.left,   1, 0, 84, 12, .5, 84,  0, .8, 78,  0);
	addPPos(letters.e.left,   2, 0, 84, 12, .5, 84, 24, .8, 78, 24);
	addPPos(letters.e.top,    1, 0, 84, 12, .5, 84,  0, .8, 78,  0);
	addPPos(letters.e.top,    2, 0, 84, 12, .5, 84,  0, .8, 90,  0);
	addPPos(letters.e.middle, 1, 0, 84, 12, .5, 84,  0, .6, 80, 12, .9, 78, 12);
	addPPos(letters.e.middle, 2, 0, 84, 12, .5, 84,  0, .6, 80, 12, .9, 86, 12);
	addPPos(letters.e.bottom, 1, 0, 84, 12, .5, 84,  0, .5, 84, 24,  1, 78, 24);
	addPPos(letters.e.bottom, 2, 0, 84, 12, .5, 84,  0, .5, 84, 24,  1, 90, 24);

	let scene = new Scene(1280, 800);
	viewport = new Viewport(mainCanvas, scene);

	let container = new ContainerNode();
	for (let i in letters) {
		for (let j in letters[i]) {
			container.addItem(letters[i][j]);
		}
	}
	Transform.addDefaultTransforms(container, 0);
	container.transform.translateX.addNumericKey(0, 505);
	container.transform.translateY.addNumericKey(0, 364);
	container.transform.translateY.addNumericKey(2, 364);
	container.transform.scaleX.addNumericKey(0, 3);
	container.transform.scaleY.addNumericKey(0, 3);
	container.transform.translateY.addNumericKey(3, 100, Easing.easeInOutQuart);
	scene.addItem(container);

	let dropareaEl = document.querySelector('#drop-area');

	let droparea = new DropArea();
	Transform.addDefaultTransforms(droparea, 0);
	droparea.transform.translateX.addNumericKey(0, 640);
	droparea.transform.translateY.addNumericKey(0, 400);
	droparea.transform.opacity.addNumericKey(0, 0);
	droparea.transform.scaleX.addNumericKey(2.5, .8);
	droparea.transform.scaleY.addNumericKey(2.5, .8);
	droparea.transform.opacity.addNumericKey(2.5, 0);
	droparea.transform.scaleX.addNumericKey(3.5, 1, Easing.easeOutExpo);
	droparea.transform.scaleY.addNumericKey(3.5, 1, Easing.easeOutExpo);
	droparea.transform.opacity.addNumericKey(3.5, 1, Easing.easeOutExpo);
	scene.addItem(droparea);

	let enter = function(e) {
		e.preventDefault(); e.stopPropagation();
		if (!droparea.dropping) {
			droparea.dropping = true;
			droparea.dropastart = Date.now();
			droparea.dropaend = Date.now() + 500;
		}
	};
	let end = function(e) {
		e.preventDefault(); e.stopPropagation();
		if (droparea.dropping) {
			droparea.dropping = false;
			droparea.dropastart = Date.now();
			droparea.dropaend = Date.now() + 500;
		}
	};
	let drop = function(e) {
		let file = e.dataTransfer.files[0];
		if (!file) return;
		if (!file.type.includes('javascript'))
			alert('Not Javascript');
		let reader = new FileReader();
		reader.onload = function(e) {
			let fn = new Function('viewport', reader.result);
			viewport.stops = [];
			viewport.pause();
			viewport.loop = false;
			fn.apply(viewport, [viewport]);
 		};
		reader.readAsText(file);
	};
	document.body.addEventListener('drag', (e) => {
		e.preventDefault(); e.stopPropagation();
	});
	document.body.addEventListener('dragstart', (e) => {
		e.preventDefault(); e.stopPropagation();
	});
	document.body.addEventListener('dragend', (e) => {
		end(e);
	});
	document.body.addEventListener('dragover', (e) => {
		enter(e);
	});
	document.body.addEventListener('dragenter', (e) => {
		enter(e);
	});
	document.body.addEventListener('dragleave', (e) => {
		end(e);
	});
	document.body.addEventListener('drop', (e) => {
		end(e);
		drop(e);
	});

	// scene.backgroundColor = '#00202d';
	scene.duration = 4;
	viewport.draw();
	viewport.addStops([3.3, 2], [4, 1]);
	viewport.loop = true;
	controls.viewport = viewport;
	controls.draw();
	viewport.play();

	viewport.on('pause', () => {
		if (controls.s.play.animto == 0)
			controls.setPlayButton(1);
	});
}