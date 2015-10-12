/*
 * draggable.js v1.1
 * 
 * author: Lin Chen https://github.com/oodzchen
 * Copyright 2015, MIT License
 *
 */

function Draggable(container, options) {

  "use strict";

  if (!container) return;

  var options = options || {};
  var isPositioned = typeof options.positioned === "boolean" ? options.positioned : true;
  var onDragFn = options.onDrag || function(){};
  var onDropFn = options.onDrop || function(){};
  var olderIE = !!navigator.userAgent.match(/MSIE 8|MSIE 7/);
  var isMobile = !!navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i);
  var events = isMobile ? {
    down: 'touchstart',
    move: 'touchmove',
    up: 'touchend'
  } : {
    down: 'mousedown',
    move: 'mousemove',
    up: 'mouseup'
  };

  console.log(events);

  var box = container.length ? container[0] : container;
  var dragElements = (options.dragElements && options.dragElements.length) ? options.dragElements : box;
  var childNodelist = box.children || (function(element) {
    var child = element.childNodes;

    for (var i = 0; i < child.length; i++) {
      if (!(child[i] instanceof Element)) element.removeChild(child[i]);
    }

    return child;
  })(box);

  var toArray = !olderIE ? Array.prototype.slice : function() {
    var ArrayLike = this;
    var result = [];

    if (!ArrayLike.length) return result;

    for (var i = 0; i < ArrayLike.length; i++) {
      result.push(ArrayLike[i]);
    }

    return result;
  };

  // Array.prototype.indexOf polyfill, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
      var k;

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var O = Object(this);
      var len = O.length >>> 0;

      if (len === 0) {
        return -1;
      }

      var n = +fromIndex || 0;

      if (Math.abs(n) === Infinity) {
        n = 0;
      }

      if (n >= len) {
        return -1;
      }

      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      while (k < len) {
        if (k in O && O[k] === searchElement) {
          return k;
        }
        k++;
      }
      return -1;
    };
  }

  var elements = toArray.call(childNodelist);
  var isStart = false;
  var boxLeft = isPositioned ? box.offsetLeft : 0;
  var boxTop = isPositioned ? box.offsetTop : 0;
  var distanceX, distanceY, dragingElement, fromElement, cloneElement, beforeList, primaryPositions;

  init();

  function init() {

    if(isPositioned) setPositions();

    primaryPositions = getPrimaryPositions(childNodelist);

    eventBind();

  }

  function setPositions() {
    box.style.position = "relative";

    for (var i = 0; i < elements.length; i++) {
      var temp = elements[i];

      temp.style.left = temp.offsetLeft - Number(getCss(temp, 'margin-left').replace(/[^\d]+/, '')) + "px";
      temp.style.top = temp.offsetTop - Number(getCss(temp, 'margin-top').replace(/[^\d]+/, '')) + "px";

      setTimeout((function(el) {
        return function() {
          el.style.position = "absolute";
        };
      })(temp), 0);

    }
  }

  function eventBind() {

    if(dragElements === box){
      addListener(box, events.down, onMouseDown);
    }else{
      for(var i = 0; i < dragElements.length; i++){
        addListener(dragElements[i], events.down, onMouseDown);
      }
    }

  }

  function onMouseDown(ev) {
    var _ev = isMobile ? ev.changedTouches[0] : (ev || window.event);

    var target = _ev.target || _ev.srcElement;
    var evX = 0,
      evY = 0;

    if (olderIE) {

      if (_ev.button !== 1) return;

      _ev.returnValue = false;

      evX = _ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      evY = _ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;

    } else {

      if (!isMobile && _ev.button !== 0 || _ev.touches && _ev.touches.length > 1) return;

      ev.preventDefault();

      evX = _ev.pageX;
      evY = _ev.pageY;
    }

    console.log(ev);

    fromElement = dragingElement = getDragingElement(target);

    if(dragingElement === null) return;

    dragingElement.style.transition = "none";

    var scrollTop = getScroll(box, true);
    var scrollLeft = getScroll(box, false);

    boxLeft = isPositioned ? box.offsetLeft - scrollLeft : 0;
    boxTop = isPositioned ? box.offsetTop - scrollTop : 0;

    distanceX = evX - (boxLeft + dragingElement.offsetLeft);
    distanceY = evY - (boxTop + dragingElement.offsetTop);
    beforeList = getCurrentList(elements);

    addListener(document, events.move, onMouseMove);
    addListener(document, events.up, onMouseUp);
  }

  function onMouseMove(ev) {
    var _ev = isMobile ? ev.changedTouches[0] : (ev || window.event);
    var evX = 0,
      evY = 0;

    if (olderIE) {
      _ev.returnValue = false;

      evX = _ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      evY = _ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;

    } else {

      ev.preventDefault();

      evX = _ev.pageX;
      evY = _ev.pageY;
    }

    var toElement = getElementByPosition(evX, evY);

    if (!isStart) {

      if(dragingElement === null) return;

      isStart = true;

      cloneElement = dragingElement.cloneNode(true);
      
      cloneElement.style.position = "absolute";
      cloneElement.style.left = boxLeft + dragingElement.offsetLeft + "px";
      cloneElement.style.top = boxTop + dragingElement.offsetTop + "px";
      dragingElement.style.visibility = "hidden";
      document.body.appendChild(cloneElement);

      var dragIndex = getIndex(dragingElement);
      onDragFn.call(box, dragIndex, cloneElement);

    } else {

      cloneElement.style.left = evX - distanceX + "px";
      cloneElement.style.top = evY - distanceY + "px";

      if (!toElement || toElement === fromElement) return;

      rearrange(toElement);
      fromElement = toElement;
    }

  }

  function onMouseUp(ev) {
    var ev = ev || window.event;

    if(isMobile){
      var nowElement = getDragingElement(ev.changedTouches[0].target);

      if (ev.touches.length > 1 || nowElement !== dragingElement || dragingElement === null) return;
    }

    if (isStart) {
      dragingElement.style.visibility = "";
      document.body.removeChild(cloneElement);
      isStart = false;
      
      var dropIndex = getIndex(fromElement);
      onDropFn.call(box, dropIndex, childNodelist[dropIndex]);
    }

    removeListener(document, 'mousemove', onMouseMove);

    dragingElement.style.transition = "";
    dragingElement = fromElement = cloneElement = null;

    if(olderIE && ev.srcElement.tagName === "A") ev.srcElement.click();

    removeListener(document, 'mouseup', onMouseUp);
  }

  function getDragingElement(clickedElement) {

    if(!box.contains(clickedElement)) return null;

    if (clickedElement.parentNode === box) {

      return clickedElement;

    } else {

      return getDragingElement(clickedElement.parentNode);
    }

  }

  function getElementByPosition(x, y) {

    var i = elements.length;

    while(i--){

      var el = beforeList[i];
      var pos = primaryPositions[i];

      var elLeft = boxLeft + pos.left;
      var elRight = elLeft + el.offsetWidth;
      var elTop = boxTop + pos.top;
      var elBottom = elTop + el.offsetHeight;

      if (x > elLeft && x < elRight && y > elTop && y < elBottom) {
        return beforeList[i];
      }

    }

    return null;

  }

  function getIndex(element) {
    return beforeList.indexOf(element);
  }

  function rearrange(toElement) {
    var fromIndex = getIndex(fromElement);
    var toIndex = getIndex(toElement);
    var dir = fromIndex < toIndex ? 1 : -1;

    // console.log("from: ", fromIndex, "to: ", toIndex);

    if(dir > 0){

      if (olderIE && toIndex === beforeList.length - 1) {
        box.appendChild(elements[fromIndex]);
      } else {
        box.insertBefore(elements[fromIndex], elements[toIndex + 1]);
      }

    }else{

      box.insertBefore(elements[fromIndex], elements[toIndex]);

    }

    elements = getCurrentList(childNodelist);

    if(!isPositioned) return;

    var i = fromIndex;
    while(i !== toIndex){

      elements[i].style.left = primaryPositions[i].left + "px";
      elements[i].style.top = primaryPositions[i].top + "px";

      i += dir;

    }

    dragingElement.style.left = primaryPositions[i].left + "px";
    dragingElement.style.top = primaryPositions[i].top + "px";

  }

  function getCurrentList(elementArray) {
    return toArray.call(elementArray);
  }

  function getPrimaryPositions(elements){
    var result = [];

    for(var i = 0; i < elements.length; i++){
      result.push({
        left: elements[i].offsetLeft - Number(getCss(elements[i], 'margin-left').replace(/[^\d]+/, '')),
        top: elements[i].offsetTop - Number(getCss(elements[i], 'margin-top').replace(/[^\d]+/, ''))
      });
    }

    return result;
  }

  function getScroll(element, isTop){
    var scroll = isTop ? element.scrollTop : element.scrollLeft;

    if(element === document.documentElement || element === document.body) return 0;

    if(scroll){
      return scroll;
    }else{
      return getScroll(element.parentNode, isTop);
    }

  }

  // utilities
  function addListener(element, type, handler) {

    if (element.addEventListener) {
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, handler);
    } else {
      element['on' + type] = handler;
    }

  }

  function removeListener(element, type, handler) {

    if (element.removeEventListener) {
      element.removeEventListener(type, handler);
    } else if (element.detachEvent) {
      element.detachEvent('on' + type, handler);
    } else {
      elemnet['on' + type] = null;
    }

  }

  function getCss(element, property){
    var isSupport = 'getComputedStyle' in window;
    var cssObj = isSupport ? window.getComputedStyle(element, null) : element.currentStyle;

    if(!!property){
      return isSupport ? cssObj.getPropertyValue(property) : cssObj[property];
    }else{
      return cssObj;
    }
    
  }

}

if(window.jQuery){
  (function($){
    $.fn.Draggable = function(options){
      return this.each(function(index, el) {
       Draggable(el, options);
      });
    }
  })(window.jQuery)
}