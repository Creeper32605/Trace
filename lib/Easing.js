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

class Easing {
	constructor() {
		if (this.constructor.name == 'Easing')
			throw new Error('Not a class');
	}
	// easing functions
	static linear(t) {
		return t;
	}
	static easeInSine(t) {
		return Math.sin((Math.PI * t - Math.PI) / 2) + 1;
	}
	static easeOutSine(t) {
		return Math.sin((Math.PI * t) / 2);
	}
	static easeInOutSine(t) {
		return Math.sin(Math.PI * t - (Math.PI / 2)) / 2 + 1/2;
	}
	static easeInQuad(t) {
		return t * t;
	}
	static easeOutQuad(t) {
		return t * (2 - t);
	}
	static easeInOutQuad(t) {
		return t < 1/2 ? (2 * t * t) : (-1 + (4 - 2 * t) * t);
	}
	static easeInCubic(t) {
		return t * t * t;
	}
	static easeOutCubic(t) {
		return (--t) * t * t + 1;
	}
	static easeInOutCubic(t) {
		return t < 1/2 ? (4 * t * t * t) : ((t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
	}
	static easeInQuart(t) {
		return t * t * t * t;
	}
	static easeOutQuart(t) {
		return 1 - (--t) * t * t * t;
	}
	static easeInOutQuart(t) {
		return t < 1/2 ? (8 * t * t * t * t) : (1 - 8 * (--t) * t * t * t);
	}
	static easeInQuint(t) {
		return t * t * t * t * t;
	}
	static easeOutQuint(t) {
		return 1 + (--t) * t * t * t * t;
	}
	static easeInOutQuint(t) {
		return t < 1/2 ? (16 * t * t * t * t * t) : (1 + 16 * (--t) * t * t * t * t);
	}
	static easeInExpo(t) {
		return Math.pow(2, 10 * (t - 1));
	}
	static easeOutExpo(t) {
		return 1 - Math.pow(2, -10 * t);
	}
	static easeInOutExpo(t) {
		return t < 1/2 ? (Math.pow(2, 10 * (2 * t - 1)) / 2) : (1 - Math.pow(2, -10 * (2 * t - 1)) / 2);
	}
	static easeInCirc(t) {
		return -Math.sqrt(1 - t * t) + 1;
	}
	static easeOutCirc(t) {
		return Math.sqrt(1 - (--t) * t);
	}
	static easeInOutCirc(t) {
		return t < 1/2 ? (1/2 * (Math.sqrt(1 - Math.pow(2 * t, 2)) - 1)) :
			(1/2 * (Math.sqrt(1 - Math.pow(2 * t - 2, 2)) + 1));
	}
}
export default Easing;