# draggable.js
Make DOM elements draggable and re-layout.

##Usage

The DOM structure is simple, put all elements you want it be draggable in a container. Here is an example:

```html
<div id="dragBox">
	<div>1</div>
	<div>2</div>
	<div>3</div>
	<div>4</div>
	<div>5</div>
	<div>6</div>
</div>
```

Simply use Draggable function like so:

```javascript
Draggable(document.getElementById('dragBox'));
```

##Config Options
The second parameter of the Draggable function is an object of config options:
- **positioned** Boolean *( default: true )* - set the draggable elements positioned


##Example
```javascript
var box = document.getElementById('dragBox');

Draggable(box, {
	positioned: true
});
```

##Demo
[http://oodzchen.com/lab/draggablejs/](http://oodzchen.com/lab/draggablejs/)

##Browser Support
Compatible with major modern desktop browsers(Firefox, Chrome, IE8+).
