# Trace Documentation
## Creating a scene
```javascript
import Viewport          from 'lib/Viewport';
import Scene             from 'lib/Scene';
import TransformableNode from 'lib/TransformableNode';
import NumericKey        from 'lib/NumericKey';
import Easing            from 'lib/Easing';

// create a canvas
var canvas = document.createElement('canvas');
canvas.style.width  = 640;
canvas.style.height = 400;
canvas.width  = 640 * devicePixelRatio;
canvas.height = 400 * devicePixelRatio;

// create simple text class
class SimpleText extends TransformableNode {
    constructor(textContent) {
        super();
        this.textContent = textContent;
    }
    draw(ctx, t) {
        super.draw(ctx, t);
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.font         = '48px sans-serif';
        ctx.fillStyle    = 'white';
        ctx.fillText(this.textContent, 0, 0);
    }
}

var scene = new Scene();
var viewport = new Viewport(canvas, scene);
var text = new SimpleText('Hello World');
scene.addItem(text);

// animate text
text.transform.scaleX.addKey(0, new NumericKey(2));
text.transform.scaleY.addKey(0, new NumericKey(2));
text.transform.opacity.addKey(0, new NumericKey(0));
text.transform.scaleX.addKey(1, new NumericKey(1, Easing.easeOutExpo);
text.transform.scaleY.addKey(1, new NumericKey(1, Easing.easeOutExpo);
text.transform.opacity.addKey(1, new NumericKey(1, Easing.easeOutExpo);

scene.backgroundColor = 'black';
scene.duration = 2;
viewport.loop = true;
viewport.play();
```