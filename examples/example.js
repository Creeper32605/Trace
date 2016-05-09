requirejs(['lib/TransformableNode', 'lib/Scene', 'lib/NumericKey', 'lib/Easing'],
	function(TransformableNode, Scene, NumericKey, Easing) {
	// sigh.. TODO: find better solution
	TransformableNode = TransformableNode.default;
	Scene = Scene.default;
	NumericKey = NumericKey.default;
	Easing = Easing.default;

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
	viewport.scene = scene;
	viewport.draw();
	viewport.loop = true;
	// viewport.loop = true;
	viewport.addStops(7, [8.5, 2], [10, 1]);
	viewport.play();
});