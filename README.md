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
- **dragElements** Array or Nodelist - a collection of DOM elements, which will be the drggable area
- **onDrag** Function - runs when start drag
- **onDrop** Function - runs when end drag

##Example
```javascript
var box = document.getElementById('dragBox');

Draggable(box, {
	positioned: true,
	dragElements: box.getElementsByTagName('div'),
	onDrag: function(fromIndex, cloneElem){},
	onDrop: function(toIndex, dropElem){}
});
```

##Demo
[http://oodzchen.com/lab/draggablejs/](http://oodzchen.com/lab/draggablejs/)

##Browser Support
Compatible with major desktop browsers (Firefox, Chrome, IE8+).

##License
Copyright (c) 2015 Lin Chen Licensed under the [The MIT License (MIT)](https://opensource.org/licenses/MIT)