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

// TODO: refactor

import Easing from 'lib/Easing';
import Viewport from 'lib/Viewport';

class Controls {
	constructor(el, canvas, app, popupEl, popupCanvas, popupTime) {
		this.el = el;
		this.app = app;
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this._viewport;
		this.s = {
			drawLoop: false,
			element: {
				// 0 for up, 1 for down
				animto: 0,
				visible: true
			},
			play: {
				// 0 for > to ||, 1 for || to >
				animto: 1,
				start: Date.now(),
				end: Date.now()
			},
			menu: {},
			fullscreen: {
				// 0 for >< to <>, 1 for <> to ><
				animto: 0,
				start: Date.now(),
				end: Date.now()
			}
		};

		// event handlers
		document.addEventListener('keydown', (e) => {
			if (e.which == 32) {
				this.setPlayButton();
			} else if (e.which == 39) {
				if (this.viewport.ignoreRepeater)
					this.viewport.ignoreRepeater = false;
				else
					this.viewport.ignoreNextIfRepeater();
			}
		});
		document.addEventListener('mousewheel', (e) => {
			this.viewport.currentTime -= e.deltaX / 60;
			if (this.viewport.currentTime < 0) this.viewport.currentTime = 0;
			if (this.viewport.currentTime > this.viewport.duration)
				this.viewport.currentTime = this.viewport.duration;
			this.draw();
		});
		this.canvas.addEventListener('click', (e) => {
			if (e.pageX < 36) {
				this.setPlayButton();
			} else if (e.pageX > innerWidth - 36) {
				if (!('xipc' in window)) {
					this.setFullscreenButton();
					if (this.app.requestFullscreen)
						this.app.requestFullscreen();
					else if (this.app.msRequestFullscreen)
						this.app.msRequestFullscreen();
					else if (this.app.mozRequestFullScreen)
						this.app.mozRequestFullScreen();
					else if (this.app.webkitRequestFullscreen)
						this.app.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				} else
					xipc.send('asynchronous-message', 'fullscreen');
			}
		});
		let dragging = false;
		this.canvas.addEventListener('mousedown', (e) => {
			if (e.pageX >= 46 && e.pageX <= innerWidth - 82) {
				dragging = true;
				this.viewport.currentTime = this.viewport.duration * (e.pageX - 46) / (innerWidth - 46 * 2);
				this.draw();
			}
		});
		let popupIsOpen = false;
		let width = 0, height = 0;
		let mVPSize = 128;
		let ppctx = popupCanvas.getContext('2d');
		let ppvp = new Viewport();
		document.addEventListener('mousemove', (e) => {
			// show/hide stuff
			if (e.pageY > innerHeight - 144 && this.s.element.animto == 1) {
				this.s.element.animto = 0;
				Velocity(this.el, 'stop');
				Velocity(this.el, {
					translateY: 0
				}, 200, 'easeOutCubic');
				this.s.element.visible = true;
				this.startDrawLoop();
			} else if (e.pageY <= innerHeight - 144 && this.s.element.animto == 0) {
				this.s.element.animto = 1;
				Velocity(this.el, 'stop');
				Velocity(this.el, {
					translateY: 36
				}, 200, 'easeInCubic', () => {
					this.s.element.visible = false;
				});
			}
			// popup stuff
			if (e.pageY > innerHeight - 36 && this.s.element.visible &&
				e.pageX >= 46 && e.pageX <= innerWidth - 46) {
				let previewAspectRatio = this.viewport.scene.width / this.viewport.scene.height;
				width = previewAspectRatio > 1 ? mVPSize : mVPSize / previewAspectRatio;
				height = (previewAspectRatio < 1 ? mVPSize : mVPSize / previewAspectRatio) + 26;
				let lpos = Math.min(innerWidth - 10 - width, Math.max(10, e.pageX - width / 2));
				let vpos = (e.pageX - 46) / (innerWidth - 46 * 2) * this.viewport.duration;
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
					ppvp.scene = this.viewport.scene;
				} else {
					Velocity.hook(popupEl, 'left', `${lpos}px`);
				}
				popupCanvas.width = (width - 10) * devicePixelRatio;
				popupCanvas.height = (height - 26) * devicePixelRatio;
				let h = Math.floor(vpos / 3600);
				let m = Math.floor((vpos % 3600) / 60);
				let s = (vpos % 3600).toFixed(2);
				popupTime.textContent = `${(h ? `${h}:` : '')}${m ? `${m}:` : ''}${s}`;
				ppvp.draw(undefined, vpos);
				this.viewport.scene.parent = this.viewport;
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
			// timeline dragging stuff
			if (!dragging) return;
			if (!this.viewport) return;
			if (this.s.play.animto == 0) {
				this.setPlayButton(1);
			}
			if (e.pageX < 46) this.viewport.currentTime = 0;
			else if (e.pageX > innerWidth - 46) this.viewport.currentTime = this.viewport.duration;
			else this.viewport.currentTime =
				this.viewport.duration * (e.pageX - 46) / (innerWidth - 46 * 2);
			this.draw();
		});
		document.addEventListener('mouseup', (e) => {
			dragging = false;
		});
	}
	get viewport() {
		return this._viewport;
	}
	set viewport(value) {
		value.on('play',       () => { this.update(); });
		value.on('pause',      () => { this.update(); });
		value.on('stop',       () => { this.update(); });
		value.on('end',        () => { this.update(); });
		value.on('timeupdate', () => { this.update(); });
		this._viewport = value;
	}
	startDrawLoop() {
		if (this.drawLoop) return;
		this.drawLoop = true;
		let loop = function() {
			if (this.s.play.end > Date.now() || this.s.fullscreen.end > Date.now() ||
				this.viewport.playing)
				requestAnimationFrame(loop);
			else
				this.drawLoop = false;
			this.draw();
		}.bind(this);
		loop();
	}
	setPlayButton(state) {
		if (state === undefined) state = this.s.play.animto == 0 ? 1 : 0;
		if (state == this.s.play.animto) return;
		this.s.play.animto = state;
		this.s.play.start = Date.now();
		this.s.play.end = Date.now() + 500;
		this.startDrawLoop();
		if (state == 0)
			this.viewport.play();
		else
			this.viewport.pause();
	}
	setFullscreenButton(state) {
		if (state == undefined) state = this.s.fullscreen.animto == 0 ? 1 : 0;
		if (state == this.s.fullscreen.animto) return;
		this.s.fullscreen.animto = state;
		this.s.fullscreen.start = Date.now();
		this.s.fullscreen.end = Date.now() + 500;
		this.startDrawLoop();
	}
	update() {
		this.startDrawLoop();
		if (this.viewport.playing && this.s.play.animto == 1)
			this.setPlayButton(0);
		else if (!this.viewport.playing && this.s.play.animto == 0)
			this.setPlayButton(1);
	}
	drawPlayButton(ctx) {
		// 16x16 in 36x36 box
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		ctx.lineCap = 'butt';
		ctx.setLineDash([]);
		ctx.clearRect(0, 0, 36, 36);
		let a = this.s.play.start, b = this.s.play.end, c = Date.now();
		let d = this.s.play.animto;
		// animation progress
		let anpr = c > b ? 1 : (c < a ? 0 : (c - a) / (b - a));
		// whether it is animating
		let anim = anpr >= 1 ? false : true;
		let t1 = Easing.easeOutExpo(Math.min(1, 2 * anpr));
		let t2 = Easing.easeOutExpo(Math.max(0, Math.min(1, 2 * anpr - 1/2)));
		let t3 = Easing.easeOutExpo(Math.max(0, Math.min(1, 2 * anpr - 1)));

		// left line
		if (anim && d == 0)      ctx.setLineDash([0, (1 - t1) * 16, 1000, 0]);
		else if (anim && d == 1) ctx.setLineDash([(1 - t2) * 16, 1000]);
		else                     ctx.setLineDash([]);
		ctx.beginPath();
		ctx.moveTo(12, 10);
		ctx.lineTo(12, 26);
		if (d == 0 || (anim && d == 1)) ctx.stroke();

		// right line
		if (anim && d == 0)      ctx.setLineDash([0, (1 - t2) * 16, 1000, 0]);
		else if (anim && d == 1) ctx.setLineDash([(1 - t1) * 16, 1000]);
		else                     ctx.setLineDash([]);
		ctx.beginPath();
		ctx.moveTo(24, 26);
		ctx.lineTo(24, 10);
		if (d == 0 || (anim && d == 1)) ctx.stroke();

		// triangle
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		if (anim && d == 0)      ctx.setLineDash([0, t1 * 50, 1000, 0]);
		else if (anim && d == 1) ctx.setLineDash([t3 * 50, 1000]);
		else                     ctx.setLineDash([]);
		ctx.beginPath();
		ctx.moveTo(25, 18);
		ctx.lineTo(11, 26);
		ctx.lineTo(11, 10);
		ctx.closePath();
		if (d == 1 || (anim && d == 0)) ctx.stroke();
	}
	drawTimeline(ctx, viewport, width) {
		ctx.strokeStyle = '#fff';
		ctx.globalAlpha = 0.5;
		ctx.lineWidth = 2;
		ctx.lineCap = 'round';
		ctx.setLineDash([]);
		ctx.clearRect(0, 0, width, 36);

		// head position in animation
		let pos = viewport.currentTime / viewport.duration;
		// head position on screen
		let xpos = pos * (width - 20) + 10;

		// draw line
		ctx.beginPath();
		ctx.moveTo(10, 18);
		ctx.lineTo(width - 10, 18);
		// draw stops
		let prevStop = -1;
		let prevStopx = 42;
		for (let k of viewport.stops) {
			let i = k[0];
			let isRepeater = k[1] == 1;
			let isMarker = k[1] == 2;
			let x = (i / viewport.duration) * (width - 20) + 10;
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
	drawFullscreenButton(ctx) {
		ctx.strokeStyle = '#fff';
		ctx.globalAlpha = 1;
		ctx.lineWidth = 2;
		ctx.lineCap = 'round';
		ctx.setLineDash([]);
		ctx.clearRect(0, 0, 36, 36);

		let a = this.s.fullscreen.start, b = this.s.fullscreen.end, c = Date.now();
		let d = this.s.fullscreen.animto;
		let fsp = c > b ? 1 : (c < a ? 0 : (c - a) / (b - a));
		let p = Easing.easeOutExpo(fsp);
		let anim = fsp >= 1 ? false : true;

		// two squares for the arrow heads
		if (d == 1 && !anim)      ctx.setLineDash([0, 1.4, 11.2, 100]);
		else if (d == 0 && !anim) ctx.setLineDash([0, 15.4, 11.2, 100]);
		else if (d == 0)          ctx.setLineDash([0, (p * 14) + 1.4, 11.2, 100]);
		else if (d == 1)          ctx.setLineDash([0, Math.max(0, (p * 14) - 12.4),
			Math.max(0, (p * 7.2) + 3.4), (p * 14) + 15.4, 11.2, 100]);

		ctx.strokeRect(10, 19, 7, 7);

		if (d == 1 && !anim)      ctx.setLineDash([0, 15.4, 11.2, 100]);
		else if (d == 0 && !anim) ctx.setLineDash([0, 1.4, 11.2, 100]);
		else if (d == 0)          ctx.setLineDash([0, Math.max(0, (p * 14) - 12.4),
			Math.max(0, (p * 7.2) + 3.4), (p * 14) + 15.4, 11.2, 100]);
		else if (d == 1)          ctx.setLineDash([0, (p * 14) + 1.4, 11.2, 100]);

		ctx.strokeRect(19, 10, 7, 7);
	}
	draw() {
		if (!this.s.element.visible) return;
		if (!this.viewport) return;
		let dp = devicePixelRatio;
		let ctx = this.ctx;
		let width = this.canvas.width / dp;
		ctx.setTransform(dp, 0, 0, dp, 0, 0);
		ctx.globalAlpha = 1;

		this.drawPlayButton(ctx);
		ctx.transform(1, 0, 0, 1, 36, 0);
		this.drawTimeline(ctx, this.viewport, width - 72);
		ctx.transform(1, 0, 0, 1, width - 72, 0);
		this.drawFullscreenButton(ctx);
	}
}
export default Controls;