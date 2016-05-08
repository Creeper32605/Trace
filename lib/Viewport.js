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

import Scene from './Scene';
class Viewport {
	constructor(canvas, scene) {
		this._p = {
			scene: undefined,
			canvas: undefined,
			renderingContext: undefined,
			drawnSceneWidth: 0,
			drawnSceneHeight: 0,
			lastCallTime: Date.now(),
			playing: false,
			playbackRate: 1,
			loop: false,
			stops: [],
			ignoreRepeater: false,
			eventListeners: {
				play: [],
				pause: [],
				stop: [],
				end: [],
				timeupdate: [],
				scenechange: [],
				canvaschange: [],
				resize: []
			}
		};
		if (canvas !== undefined) this.canvas = canvas;
		if (scene !== undefined) this.scene = scene;
	}
	get canvas() {
		return this._p.canvas;
	}
	set canvas(value) {
		if (!(value instanceof HTMLCanvasElement) && !(value instanceof CanvasRenderingContext2D))
			throw new Error('Canvas must be a canvas element or a rendering context');
		if (value instanceof HTMLCanvasElement) {
			this._p.canvas = value;
			this._p.renderingContext = value.getContext('2d');
		} else if (value instanceof CanvasRenderingContext2D) {
			this._p.renderingContext = value;
			this._p.canvas = value.canvas;
		}
		this.dispatchEvent('canvaschange');
	}
	get scene() {
		return this._p.scene;
	}
	set scene(value) {
		if (!(value instanceof Scene)) throw new Error('Scene must be a scene');
		this._p.scene = value;
		this.dispatchEvent('scenechange');
	}
	get playing() {
		return this._p.playing;
	}
	get playbackRate() {
		return this._p.playbackRate;
	}
	set playbackRate(value) {
		if (!Number.isFinite(value)) throw new Error('Value must be a finite number');
		this._p.playbackRate = value;
	}
	get loop() {
		return this._p.loop;
	}
	set loop(value) {
		if(typeof value != 'boolean') throw new Error('Value must be a boolean');
		this._p.loop = value;
	}
	get currentTime() {
		if (!this.scene) throw new Error('No scene');
		return this.scene.currentTime;
	}
	set currentTime(value) {
		if (!this.scene) throw new Error('No scene');
		this.scene.currentTime = value;
		this.draw();
		this.dispatchEvent('timeupdate');
	}
	get duration() {
		if (!this.scene) throw new Error('No scene');
		return this.scene.duration;
	}
	set duration(value) {
		if (!this.scene) throw new Error('No scene');
		this.scene.duration = value;
	}
	get stops() {
		return this._p.stops;
	}
	set stops(value) {
		this._p.stops = value; // todo: perform type check
	}
	on(evt, fn) {
		if (!this._p.eventListeners.hasOwnProperty(evt)) throw new Error('No such event');
		if (typeof fn != 'function') throw new Error('Argument 1 is not a function');
		this._p.eventListeners[evt].push(fn);
	}
	off(evt, fn) {
		if (!this._p.eventListeners.hasOwnProperty(evt)) throw new Error('No such event');
		if (typeof fn != 'function') throw new Error('Argument 1 is not a function');
		if (this._p.eventListeners[evt].includes(fn)) {
			this._p.eventListeners[evt].splice(this._p.eventListeners[evt].indexOf(fn), 1);
			return true;
		}
		return false;
	}
	dispatchEvent(evt) {
		if(!this._p.eventListeners.hasOwnProperty(evt)) throw new Error('No such event');
		for(let i of this._p.eventListeners[evt]) {
			try {
				i();
			} catch(err) {}
		}
	}
	resized() {
		this.dispatchEvent('resize');
		this.draw();
	}
	addStop(time, type = 0) {
		if (!Number.isFinite(time) || time < 0) throw new Error('Value must be a positive finite number');
		if (type != 0 && type != 1 && type != 2) throw new Error('Type must either be 0 1, or 2');
		this._p.stops.push([time, type]);
	}
	addStops(...arr) {
		for (let i of arr) {
			if (typeof i == 'number')
				this.addStop(i);
			else if (i instanceof Array)
				this.addStop(...i);
		}
	}
	removeStop(time) {
		for (let i in this._p.stops) {
			if (this._p.stops[i][0] == time) {
				this._p.stops.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	get ignoreRepeater() {
		return this._p.ignoreRepeater;
	}
	set ignoreRepeater(value) {
		if (typeof value != 'boolean') throw new Error('Value must be a boolean');
		this._p.ignoreRepeater = value;
	}
	ignoreNextIfRepeater() {
		let lastStop = 0;
		for (let k of this.stops) {
			if (k[0] > this.scene.currentTime && lastStop < this.scene.currentTime) {
				if (k[1] == 1) {
					this.ignoreRepeater = true;
					return true;
				}
				break;
			}
			lastStop = k[0];
		}
		return false;
	}
	playLoop() {
		let now = Date.now();
		let dt = (now - this._p.lastCallTime) / 1000 * this.playbackRate;
		let stop = false;
		let prevStop = 0;
		for (let k of this.stops) {
			let i = k[0];
			if(i > this.scene.currentTime && i <= this.scene.currentTime + dt) {
				if (k[1] == 0) {
					this.scene.currentTime = i;
					this.pause();
					stop = true;
				} else if (k[1] == 1) {
					if (!this.ignoreRepeater)
						this.scene.currentTime = prevStop;
					else
						this.ignoreRepeater = false;
				} else if (k[1] == 2) {
					// nothing..
				}
				this.dispatchEvent('stop');
				break;
			}
			prevStop = i;
		}
		if (!stop) {
			this.scene.currentTime += dt;
			if (this.scene.currentTime > this.scene.duration) {
				if (this.loop) this.scene.currentTime = 0;
				else {
					this.scene.currentTime = this.scene.duration;
					this.pause();
					this.dispatchEvent('end');
				}
			}
		}
		this.dispatchEvent('timeupdate');
		this.draw();
		this._p.lastCallTime = now;
	}
	play() {
		if (!this.scene) throw new Error('No scene');
		if (!this._p.renderingContext) throw new Error('No canvas');
		this._p.playing = true;
		this._p.lastCallTime = Date.now();
		let loop = function() {
			if (this.playing) {
				requestAnimationFrame(loop);
			} else return;
			this.playLoop();
		}.bind(this);
		loop();
		this.dispatchEvent('play');
	}
	pause() {
		this._p.playing = false;
		this.dispatchEvent('pause');
	}
	draw(_, t) {
		if (!this.scene) throw new Error('No scene');
		if (!this._p.renderingContext) throw new Error('No canvas');
		let ctx = this._p.renderingContext;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		let ctxWidth = this.canvas.width;
		let ctxHeight = this.canvas.height;
		ctx.clearRect(0, 0, ctxWidth, ctxHeight);
		this.scene.scaleFactor = devicePixelRatio *
			Math.min(ctxWidth / devicePixelRatio / this.scene.width,
				ctxHeight / devicePixelRatio / this.scene.height);
		this._p.drawnSceneWidth = this.scene.width * this.scene.scaleFactor;
		this._p.drawnSceneHeight = this.scene.height * this.scene.scaleFactor;
		this.applyTransformTo(ctx);
		if (t) this.scene.drawAt(ctx, t, this);
		else this.scene.draw(ctx, null, this);
	}
	applyTransformTo(ctx, t) {
		ctx.setTransform(1, 0, 0, 1, (this.canvas.width - this._p.drawnSceneWidth) / 2,
			(this.canvas.height - this._p.drawnSceneHeight) / 2);
		ctx.globalAlpha = 1;
	}
}
export default Viewport;