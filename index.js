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
let ctrlState = {
	// controls element
	// which animation is playing: 0 for up, 1 for down
	ctrlelanto: 0,
	// whether it is on screen
	ctrlelvisible: true,
	// play/pause button
	// which animation is playing: 0 for > to ||, 1 for || to >
	playpauseanto: 1,
	// animation progress: start time, end time
	playpauseanims: Date.now(),
	playpauseanime: Date.now() + 1,
	// menu (with button)
	// which animation is playing: 0 for close, 1 for open 
	menuanto: 0,
	// animation progress: start time, end time
	menuanims: Date.now(),
	menuanime: Date.now() + 1,
	// fullscreen button
	// which animation is playing: 0 for >< to <>, 1 for <> to ><
	fullscreenanto: 0,
	// animation progress: start time, end time
	fullscreenanims: Date.now(),
	fullscreenanime: Date.now() + 1
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
};
resizeCanvases();
window.onresize = resizeCanvases;

document.addEventListener('mousemove', function(e) {
	if (e.pageY > innerHeight - 144 && ctrlState.ctrlelanto == 1) {
		ctrlState.ctrlelanto = 0;
		Velocity(controlsEl, 'stop');
		Velocity(controlsEl, {
			translateY: 0
		}, 200, 'easeOutCubic');
		ctrlState.ctrlelvisible = true;
	} else if (e.pageY <= innerHeight - 144 && ctrlState.ctrlelanto == 0) {
		ctrlState.ctrlelanto = 1;
		Velocity(controlsEl, 'stop');
		Velocity(controlsEl, {
			translateY: 36
		}, 200, 'easeInCubic', () => {
			ctrlState.ctrlelvisible = false;
		});
	}
});

let togglePlayPause = function(state) {
	ctrlState.playpauseanto = state ? state : ctrlState.playpauseanto == 0 ? 1 : 0;
	ctrlState.playpauseanims = Date.now();
	ctrlState.playpauseanime = Date.now() + 500;
	if (ctrlState.playpauseanto == 0) {
		viewport.play();
	} else {
		viewport.pause();
	}
};

ctrlCanvas.addEventListener('click', function(e) {
	if (e.pageX < 36) {
		togglePlayPause();
	} else if (e.pageX > innerWidth - 72 && e.pageX < innerWidth - 36) {
		ctrlState.menuanto = ctrlState.menuanto == 0 ? 1 : 0;
		ctrlState.menuanims = Date.now();
		ctrlState.menuanime = Date.now() + 500;
	} else if (e.pageX > innerWidth - 36) {
		if (xipc.fake) {
			ctrlState.fullscreenanto = ctrlState.fullscreenanto == 0 ? 1 : 0;
			ctrlState.fullscreenanims = Date.now();
			ctrlState.fullscreenanime = Date.now() + 500;
			if (app.requestFullscreen) {
				app.requestFullscreen();
			} else if (app.msRequestFullscreen) {
				app.msRequestFullscreen();
			} else if (app.mozRequestFullScreen) {
				app.mozRequestFullScreen();
			} else if (app.webkitRequestFullscreen) {
				app.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		}
		xipc.send('asynchronous-message', 'fullscreen');
	}
});
xipc.on('fullscreen-notifier', function(e, state) {
	ctrlState.fullscreenanto = state == 'true' ? 1 : 0;
	ctrlState.fullscreenanims = Date.now();
	ctrlState.fullscreenanime = Date.now() + 500;
});
document.addEventListener('keydown', function(e) {
	if (e.which == 32) {
		togglePlayPause();
	} else if (e.which == 39) {
		if (viewport.ignoreRepeater)
			viewport.ignoreRepeater = false;
		else
			viewport.ignoreNextIfRepeater();
	}
});
document.addEventListener('mousewheel', function(e) {
	viewport.currentTime -= e.deltaX / 60;
	if (viewport.currentTime < 0) viewport.currentTime = 0;
	if (viewport.currentTime > viewport.duration) viewport.currentTime = viewport.duration;
});
{
	let dragging = false;
	ctrlCanvas.addEventListener('mousedown', function(e) {
		if (e.pageX >= 46 && e.pageX <= innerWidth - 82) {
			dragging = true;
			viewport.currentTime = viewport.duration * (e.pageX - 46) / (innerWidth - 82 - 46);
		}
	});
	document.addEventListener('mousemove', function(e) {
		if (!dragging) return;
		if (ctrlState.playpauseanto == 0) {
			togglePlayPause();
		}
		if (e.pageX < 46) viewport.currentTime = 0;
		else if (e.pageX > innerWidth - 82) viewport.currentTime = viewport.duration;
		else
			viewport.currentTime = viewport.duration * (e.pageX - 46) / (innerWidth - 82 - 46);
	});
	document.addEventListener('mouseup', function(e) {
		dragging = false;
	});
}
{
	let popupIsOpen = false;
	let width = 0, height = 0;
	let mVPSize = 128;
	let ppctx = ppupCanvas.getContext('2d');
	let ppvp = new Viewport();
	document.addEventListener('mousemove', function(e) {
		if (e.pageY > innerHeight - 36 && ctrlState.ctrlelanto == 0 &&
			e.pageX >= 46 && e.pageX <= innerWidth - 82) {
			let previewAspectRatio = viewport.scene.width / viewport.scene.height;
			width = previewAspectRatio > 1 ? mVPSize : mVPSize / previewAspectRatio;
			height = (previewAspectRatio < 1 ? mVPSize : mVPSize / previewAspectRatio) + 26;
			let lpos = Math.min(innerWidth - 10 - width, Math.max(10, e.pageX - width / 2));
			let vpos = (e.pageX - 46) / (innerWidth - 82 - 46) * viewport.duration;
			if (!popupIsOpen) {
				popupIsOpen = true;
				Velocity(popupEl, 'stop');
				Velocity.hook(popupEl, 'width', `${width}px`);
				Velocity.hook(popupEl, 'height', `${height}px`);
				Velocity.hook(popupEl, 'bottom', '40px');
				Velocity.hook(popupEl, 'left', `${lpos}px`);
				popupEl.style.transformOrigin = `${e.pageX - lpos}px ${height}px`;
				Velocity.hook(popupEl, 'scaleX', 0);
				Velocity.hook(popupEl, 'scaleY', 0);
				Velocity(popupEl, {
					scaleX: 1,
					scaleY: 1
				}, 200, 'easeOutExpo');
				ppvp.canvas = ppctx;
				ppvp.scene = viewport.scene;
			} else {
				Velocity.hook(popupEl, 'left', `${lpos}px`);
			}
			ppupCanvas.width = (width - 10) * dp;
			ppupCanvas.height = (height - 26) * dp;
			let h = Math.floor(vpos / 3600);
			let m = Math.floor((vpos % 3600) / 60);
			let s = (vpos % 3600).toFixed(2);
			popupTime.textContent = `${(h ? `${h}:` : '')}${m ? `${m}:` : ''}${s}`;
			ppvp.draw(undefined, vpos);
		} else {
			if (popupIsOpen) {
				popupIsOpen = false;
				Velocity(popupEl, 'stop');
				Velocity(popupEl, {
					scaleX: 0,
					scaleY: 0
				}, 200);
			}
		}
	});
}

let drawControls;
{
	let ctx = ctrlCanvas.getContext('2d');
	drawControls = function() {
		requestAnimationFrame(drawControls);
		// don't draw if not visible
		if (ctrlState.ctrlelvisible == false)
			return;
		// LAYOUT
		// PLAY | TIMELINE (flex adjust) | OPTIONS | FULLSCREEN
		// play/pause button
		ctx.setTransform(dp, 0, 0, dp, 0, 0);
		ctx.globalAlpha = 1;
		let ctxw = ctrlCanvas.width / dp;
		{
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 2;
			ctx.lineCap = 'butt';
			ctx.clearRect(0, 0, 36, 36);
			// 16x16 icon in 36x36 box, with padding
			let a = ctrlState.playpauseanims, b = ctrlState.playpauseanime, c = Date.now();
			let d = ctrlState.playpauseanto;
			let ppp = c > b ? 1 : (c < a ? 0 : (c - a) / (b - a));
			let anim = ppp >= 1 ? false : true;
			let t1 = Easing.easeOutExpo(Math.min(1, 2 * ppp));
			let t2 = Easing.easeOutExpo(Math.max(0, Math.min(1, 2 * ppp - 1/2)));
			let t3 = Easing.easeOutExpo(Math.max(0, Math.min(1, 2 * ppp - 1)));

			// left line
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.moveTo(12, 10);
			ctx.lineTo(12, 26);
			if (anim && d == 0) {
				ctx.setLineDash([0, (1 - t1) * 16, 1000, 0]);
			} else if (anim && d == 1) {
				ctx.setLineDash([(1 - t2) * 16, 1000]);
			}
			if (d == 0 || (anim && d == 1)) ctx.stroke();
			// right line
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.moveTo(24, 26);
			ctx.lineTo(24, 10);
			if (anim && d == 0) {
				ctx.setLineDash([0, (1 - t2) * 16, 1000, 0]);
			} else if (anim && d == 1) {
				ctx.setLineDash([(1 - t1) * 16, 1000]);
			}
			if (d == 0 || (anim && d == 1)) ctx.stroke();
			// arrow
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.moveTo(25, 18);
			ctx.lineTo(11, 26);
			ctx.lineTo(11, 10);
			ctx.closePath();
			if (anim && d == 0) {
				ctx.setLineDash([0, t1 * 50, 1000, 0]);
			} else if (anim && d == 1) {
				ctx.setLineDash([t3 * 50, 1000]);
			}
			if (d == 1 || (anim && d == 0)) ctx.stroke();
		}
		// timeline slider
		{
			ctx.strokeStyle = '#fff';
			ctx.globalAlpha = 0.5;
			ctx.lineWidth = 2;
			ctx.lineCap = 'round';
			ctx.setLineDash([]);
			ctx.clearRect(36, 0, ctxw - 72, 36);

			// head position
			let pos = viewport.currentTime / viewport.duration;
			let xpos = pos * (ctxw - 82 - 46) + 46;

			// draw line
			ctx.beginPath();
			ctx.moveTo(46, 18);
			ctx.lineTo(ctxw - 82, 18);
			// draw stops
			let prevStop = -1;
			let prevStopx = 42;
			for (let k of viewport.stops) {
				let i = k[0];
				let isRepeater = k[1] == 1;
				let isMarker = k[1] == 2;
				let x = (i / viewport.duration) * (ctxw - 82 - 46) + 46;
				// draw underline if repeater
				if (isRepeater) {
					ctx.moveTo(prevStopx + 4, 21);
					ctx.lineTo(x - 4, 21);
				}
				let isNextStop = viewport.currentTime < i && viewport.currentTime > prevStop;
				prevStopx = x;
				if (isRepeater)
					prevStop = i;
				if (x > xpos - 5 && x < xpos + 5) {
					let dx = Easing.easeOutQuart(1 - Math.abs(xpos - x) / 5);
					if (isMarker) {
						ctx.moveTo(x, 19 + dx * 8);
						ctx.lineTo(x, 22 + dx * 7);
						continue;
					}
					ctx.moveTo(x, 14 + dx * 13);
					ctx.lineTo(x, 22 + dx * 7);
					// draw closed "gate" below if repeater
					if (isRepeater && isNextStop && !viewport.ignoreRepeater) {
						ctx.moveTo(x - 4, 21 + dx * 7);
						ctx.lineTo(x - 4, 22 + dx * 7);
					}
					continue;
				}
				if (isMarker) {
					ctx.moveTo(x, 18);
					ctx.lineTo(x, 22);
					continue;
				}
				ctx.moveTo(x, 14);
				ctx.lineTo(x, 22);
				// draw closed gate if repeater
				if (isRepeater && isNextStop && !viewport.ignoreRepeater) {
					ctx.moveTo(x - 4, 14);
					ctx.lineTo(x - 5, 14);
				}
			}
			ctx.stroke();

			// draw head
			ctx.globalAlpha = 0.75;
			ctx.clearRect(xpos - 3, 12, 6, 12);
			ctx.beginPath();
			ctx.moveTo(xpos, 12);
			ctx.lineTo(xpos, 24);
			ctx.stroke();
		}
		// options button
		{
			ctx.strokeStyle = '#fff';
			ctx.globalAlpha = 1;
			ctx.lineWidth = 2;
			ctx.lineCap = 'round';
			ctx.setLineDash([]);
			ctx.clearRect(ctxw - 72, 0, 36, 36);
			let a = ctrlState.menuanims, b = ctrlState.menuanime, c = Date.now();
			let d = ctrlState.menuanto;
			let mbp = c > b ? 1 : (c < a ? 0 : (c - a) / (b - a));
			let anim = mbp >= 1 ? false : true;
			let p = Easing.easeOutExpo(mbp);
			// three dots
			ctx.beginPath();
			if (d == 0 && !anim) {
				ctx.moveTo(ctxw - 62, 17.5);
				ctx.lineTo(ctxw - 62, 18.5);
			} else if (d == 1 && !anim) {
				ctx.moveTo(ctxw - 62, 13);
				ctx.lineTo(ctxw - 52, 13);
			} else if (d == 0) {
				ctx.moveTo(ctxw - 62 + p * 10, 13 + p * 4.5);
				ctx.lineTo(ctxw - 52, 13 + p * 5.5);
			} else if (d == 1) {
				ctx.moveTo(ctxw - 62, 18.5 - p * 5.5);
				ctx.lineTo(ctxw - 62 + p * 10, 17.5 - p * 4.5);
			}
			if (d == 0 && !anim) {
				ctx.moveTo(ctxw - 57, 17.5);
				ctx.lineTo(ctxw - 57, 18.5);
			} else if (d == 1 && !anim) {
				ctx.moveTo(ctxw - 62, 18);
				ctx.lineTo(ctxw - 52, 18);
			} else if (d == 0) {
				ctx.moveTo(ctxw - 62 + p * 5, 18 - p * .5);
				ctx.lineTo(ctxw - 52 - p * 5, 18 + p * .5);
			} else if (d == 1) {
				ctx.moveTo(ctxw - 57 - p * 5, 18.5 - p * .5);
				ctx.lineTo(ctxw - 57 + p * 5, 17.5 + p * .5);
			}
			if (d == 0 && !anim) {
				ctx.moveTo(ctxw - 52, 17.5);
				ctx.lineTo(ctxw - 52, 18.5);
			} else if (d == 1 && !anim) {
				ctx.moveTo(ctxw - 62, 23);
				ctx.lineTo(ctxw - 52, 23);
			} else if (d == 0) {
				ctx.moveTo(ctxw - 62, 23 - p * 5.5);
				ctx.lineTo(ctxw - 52 - p * 10, 23 - p * 4.5);
			} else if (d == 1) {
				ctx.moveTo(ctxw - 52 - p * 10, 18.5 + p * 4.5);
				ctx.lineTo(ctxw - 52, 17.5 + p * 5.5);
			}
			ctx.stroke();

			// draw menu
			// LAYOUT
			// ...?
			if (d == 1 && !anim) {

			} else if (d == 0) {

			}
		}
		// fullscreen button
		{
			ctx.strokeStyle = '#fff';
			ctx.globalAlpha = 1;
			ctx.lineWidth = 2;
			ctx.lineCap = 'round';
			ctx.setLineDash([]);
			ctx.clearRect(ctxw - 36, 0, 36, 36);

			let a = ctrlState.fullscreenanims, b = ctrlState.fullscreenanime, c = Date.now();
			let d = ctrlState.fullscreenanto;
			let fsp = c > b ? 1 : (c < a ? 0 : (c - a) / (b - a));
			let p = Easing.easeOutExpo(fsp);
			let anim = fsp >= 1 ? false : true;

			// two squares for the arrow heads
			if (d == 1 && !anim)
				ctx.setLineDash([0, 1.4, 11.2, 100]);
			else if (d == 0 && !anim)
				ctx.setLineDash([0, 15.4, 11.2, 100]);
			else if (d == 0) {
				ctx.setLineDash([0, (p * 14) + 1.4, 11.2, 100]);
			} else if (d == 1) {
				ctx.setLineDash([0, Math.max(0, (p * 14) - 12.4),
					Math.max(0, (p * 7.2) + 3.4), (p * 14) + 15.4, 11.2, 100]);
			}
			ctx.strokeRect(ctxw - 26, 19, 7, 7);
			if (d == 1 && !anim)
				ctx.setLineDash([0, 15.4, 11.2, 100]);
			else if (d == 0 && !anim)
				ctx.setLineDash([0, 1.4, 11.2, 100]);
			else if (d == 0) {
				ctx.setLineDash([0, Math.max(0, (p * 14) - 12.4),
					Math.max(0, (p * 7.2) + 3.4), (p * 14) + 15.4, 11.2, 100]);
			} else if (d == 1) {
				ctx.setLineDash([0, (p * 14) + 1.4, 11.2, 100]);
			}
			ctx.strokeRect(ctxw - 17, 10, 7, 7);
		}
	};
}
drawControls();

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

	viewport.on('pause', () => {
		if (ctrlState.playpauseanto == 0)
			togglePlayPause(1);
	});
}