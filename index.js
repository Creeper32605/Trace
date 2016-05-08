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
import NumericKey from 'lib/NumericKey';

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

xipc.on('fullscreen-notifier', function(e, state) {
	controls.setFullscreenButton(state == 'true' ? 1 : 0);
});

{
	let TitleNode = class TitleNode extends TransformableNode {
		constructor(text, fontSize, italic) {
			super();
			this.text = text;
			this.fontSize = fontSize;
			this.italic = italic;
		}
		draw(ctx, t) {
			super.draw(ctx, t);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = `${this.italic ? `italic` :
				``} 500 ${this.fontSize}px Avenir Next, Montserrat, Lato, sans-serif`;
			ctx.fillStyle = '#fff';
			ctx.fillText(this.text, 0, 0);
		}
	};
	let scene = new Scene(1280, 800);
	viewport = new Viewport(mainCanvas, scene);
	let title = new TitleNode('Hello World');
	title.transform.translateX.addKey(0, new NumericKey(640));
	title.transform.translateY.addKey(0, new NumericKey(400));
	title.transform.scaleX    .addKey(0, new NumericKey(2));
	title.transform.scaleY    .addKey(0, new NumericKey(2));
	title.transform.rotate    .addKey(0, new NumericKey(0));
	title.transform.opacity   .addKey(0, new NumericKey(0));
	title.transform.translateY.addKey(2, new NumericKey(400));
	title.transform.scaleX    .addKey(2, new NumericKey(1, Easing.easeOutExpo));
	title.transform.scaleY    .addKey(2, new NumericKey(1, Easing.easeOutExpo));
	title.transform.opacity   .addKey(2, new NumericKey(1, Easing.easeOutExpo));
	title.transform.translateY.addKey(2.3, new NumericKey(600, Easing.easeInCubic))
	title.transform.opacity   .addKey(2.3, new NumericKey(0,   Easing.easeInCubic));
	scene.addItem(title);
	let createFlashTitle = function(t, text, xs, yo = 0, fs = 48, it = false) {
		if (xs === undefined) xs = 1;
		let title2 = new TitleNode(text, fs, it);
		title2.transform.translateX.addKey(0, new NumericKey(640));
		title2.transform.translateY.addKey(0, new NumericKey(400 + yo));
		title2.transform.scaleX    .addKey(0, new NumericKey(0));
		title2.transform.scaleY    .addKey(0, new NumericKey(0));
		title2.transform.rotate    .addKey(0, new NumericKey(0));
		title2.transform.opacity   .addKey(0, new NumericKey(0));
		title2.transform.translateX.addKey(t, new NumericKey(640));
		title2.transform.translateY.addKey(t, new NumericKey(400 + yo));
		title2.transform.scaleX    .addKey(t, new NumericKey(0));
		title2.transform.scaleY    .addKey(t, new NumericKey(0));
		title2.transform.rotate    .addKey(t, new NumericKey(0));
		title2.transform.opacity   .addKey(t, new NumericKey(0));
		title2.transform.scaleX    .addKey(t + 1, new NumericKey(1, Easing.easeOutExpo));
		title2.transform.scaleY    .addKey(t + 1, new NumericKey(1, Easing.easeOutExpo));
		title2.transform.opacity   .addKey(t + 1, new NumericKey(1, Easing.easeOutExpo));
		title2.transform.translateY.addKey(t + 1 + xs, new NumericKey(400 + yo));
		title2.transform.opacity   .addKey(t + 1 + xs, new NumericKey(1));
		title2.transform.translateY.addKey(t + 1.3 + xs, new NumericKey(600 + yo, Easing.easeInCubic));
		title2.transform.opacity   .addKey(t + 1.3 + xs, new NumericKey(0, Easing.easeInCubic));
		scene.addItem(title2);
	}
	createFlashTitle(2, 'This is', undefined, -50, 32);
	createFlashTitle(2, 'An Example', undefined, undefined, 75);
	createFlashTitle(4, 'Of Mediocre Animation', 0);
	createFlashTitle(5, 'And Text', 0);
	createFlashTitle(6, 'This Will Stop the Playback', 0);
	createFlashTitle(6, 'press play to continue', 0, 50, 24);
	createFlashTitle(7, 'And now:', 0);
	createFlashTitle(7, 'wait for it', 0, 50, 24, true);
	createFlashTitle(8.5, 'A Repeater', 0);
	createFlashTitle(8.5, 'use right-arrow button to continue', 0, 50, 24);
	createFlashTitle(10, 'The End', 0);
	scene.backgroundColor = '#00202d';
	scene.duration = 11.5;
	viewport.draw();
	viewport.loop = true;
	// viewport.loop = true;
	viewport.addStops(7, [8.5, 2], [10, 1]);
	controls.viewport = viewport;
	controls.draw();

	viewport.on('pause', () => {
		if (controls.s.play.animto == 0)
			controls.setPlayButton(1);
	});
}