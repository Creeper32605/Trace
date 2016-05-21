exports.RectNode = class RectNode extends TransformableNode {
	constructor(w = 400, h = 400, r = 10, c = '#fff') {
		super();
		this._p.width = w;
		this._p.height = h;
		this._p.radius = r;
		this._p.color = c;
	}
	get width() { return this._p.width; }
	get height() { return this._p.height; }
	get radius() { return this._p.radius; }
	set width(value) {
		if (!Number.isFinite(value)) throw new Error('value is not finite');
		this._p.width = value;
	}
	set height(value) {
		if (!Number.isFinite(value)) throw new Error('value is not finite');
		this._p.height = value;
	}
	set radius(value) {
		if (!Number.isFinite(value)) throw new Error('value is not finite');
		this._p.radius = value;
	}
	get color() { return this._p.color; }
	set color(value) {
		this._p.color = value;
	}
	draw(ctx, t) {
		super.draw(ctx, t);
		let w = this.width / 2, h = this.height / 2, r = this.radius / 2;
		ctx.beginPath();
		ctx.moveTo(-w, -h + 2 * r);
		ctx.arcTo( -w, -h, -w + r,     -h, 2 * r);
		ctx.arcTo(  w, -h,      w, -h + r, 2 * r);
		ctx.arcTo(  w,  h,  w - r,      h, 2 * r);
		ctx.arcTo( -w,  h,     -w,  h - r, 2 * r);
		ctx.closePath();
		ctx.fillStyle = this.color;
		ctx.fill();
		console.log(this);
	}
}

/* +-[     1.0      ]-=<|-++---+-|-++-+--+|-++-+++-|>=------------------+ *\
B0V4YW1wbGUFAAMgAAAACgAAAAAFAAAAAwAAAQhSZWN0Tm9kZQAAAAABOQAUdHJhbnNmb3JtLnRy
YW5zbGF0ZVgAAAAYCk51bWVyaWNLZXkAAAABMAAAAAM2NDAAABR0cmFuc2Zvcm0udHJhbnNsYXRl
WQAAABgKTnVtZXJpY0tleQAAAAEwAAAAAzQwMAAAEHRyYW5zZm9ybS5zY2FsZVgAAAA+Ck51bWVy
aWNLZXkAAAABMAAAAAEwAApOdW1lcmljS2V5AAAAATEAAAABMRJFYXNpbmcuZWFzZU91dEV4cG8A
EHRyYW5zZm9ybS5zY2FsZVkAAAA+Ck51bWVyaWNLZXkAAAABMAAAAAEwAApOdW1lcmljS2V5AAAA
ATEAAAABMRJFYXNpbmcuZWFzZU91dEV4cG8AEXRyYW5zZm9ybS5vcGFjaXR5AAAAFgpOdW1lcmlj
S2V5AAAAATAAAAABMQA=
\* +------------------=<|-++--+-+|-++-+++-|-++--+--|>=------------------+ */