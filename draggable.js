/*
 *author: Lin Chen
 *date: 2015-9-19
 *todo: make it configurable ...
 */

function Drag(selector, options){
var box = document.querySelector(selector);
var els = Array.prototype.slice.call(box.children);
var isStart = false;
var distX = distY = 0;
var dragEl, onEl;
var orgList, posArr;

init();

function init(){
 initPos();
 eventBind();
}

function initPos(){
 box.style.position = "relative";
 for(var i = 0; i < els.length; i++){
   var curEl = els[i];
   curEl.style.left = curEl.offsetLeft + "px";
   curEl.style.top = curEl.offsetTop + "px";

   setTimeout((function(el){
     return function(){
       el.style.position = "absolute";
     };
   })(curEl), 0);
 }
}

function eventBind(){
 box.addEventListener("mousedown", onMouseDown, false);
}

function onMouseDown(ev){
 ev.preventDefault();

 onEl = dragEl = getDragEl(ev.target);
 dragEl.style.transition = "none";
 distX = ev.pageX - (box.offsetLeft + dragEl.offsetLeft);
 distY = ev.pageY - (box.offsetTop + dragEl.offsetTop);
 posArr = getPosArr(els);
 orgList = getOrgList(els);

 document.addEventListener("mousemove", onMouseMove, false);
 document.addEventListener("mouseup", onMouseUp, false);
}

function onMouseMove(ev){
 var toEl = getElByPos(ev.pageX, ev.pageY);

 ev.preventDefault();

 if(!isStart){
   isStart = true;
   cloneEl = dragEl.cloneNode(true);
   cloneEl.style.left = box.offsetLeft + dragEl.offsetLeft + "px";
   cloneEl.style.top = box.offsetTop + dragEl.offsetTop + "px";
   dragEl.style.visibility = "hidden";
   document.body.appendChild(cloneEl);
 }else{
   cloneEl.style.left = ev.pageX - distX + "px";
   cloneEl.style.top = ev.pageY - distY + "px";

   if(!toEl || toEl === onEl) return;
   rePosEls(toEl);
   onEl = toEl;
 }
}

function onMouseUp(ev){
 console.log(isStart);
 if(isStart){
   dragEl.style.visibility = "";
   document.body.removeChild(cloneEl);
   isStart = false;
 }

 dragEl.style.transition = "";
 dragEl = cloneEl = null;
 document.removeEventListener("mousemove", onMouseMove);
 document.removeEventListener("mouseup", onMouseUp);
}

function getDragEl(el){
 if(el.parentNode === box){
   return el;
 }else{
   return getDragEl(el.parentNode);
 }
}

function getElByPos(x, y, index){

 if(index === els.length) return null;

 var i = index || 0;
 var el = orgList[i];
 var pos = posArr[i];

 var elLeft = box.offsetLeft + pos.left;
 var elRight = elLeft + el.offsetWidth;
 var elTop = box.offsetTop + pos.top;
 var elBottom = elTop + el.offsetHeight;

 if(x > elLeft && x < elRight && y > elTop && y < elBottom){
   return orgList[i];
 }else{
   return getElByPos(x, y, i+1);
 }

}

function getIndex(el){
 return orgList.indexOf(el);
}

function rePosEls(el){
 var prevIndex = getIndex(onEl);
 var toIndex = getIndex(el);
 var isForward = prevIndex < toIndex;

 // console.log("frome: ", prevIndex, "to: ", toIndex);

 if(isForward){
   box.insertBefore(els[prevIndex], els[toIndex+1]);
   els = Array.prototype.slice.call(box.children);

   for(var i = prevIndex; i < toIndex; i++){
     els[i].style.left = posArr[i].left + "px";
     els[i].style.top = posArr[i].top + "px";
   }
 }else{
   box.insertBefore(els[prevIndex], els[toIndex]);
   els = Array.prototype.slice.call(box.children);

   for(var i = prevIndex; i > toIndex; i--){
     els[i].style.left = posArr[i].left + "px";
     els[i].style.top = posArr[i].top + "px";
   }
 }

 dragEl.style.left = posArr[i].left + "px";
 dragEl.style.top = posArr[i].top + "px";

}

function getPosArr(elArr){
 var res = [];
 for(var i = 0; i < elArr.length; i++){
   res.push({
     left: elArr[i].offsetLeft,
     top: elArr[i].offsetTop
   });
 }

 return res;
}

function getOrgList(elArr){
 return Array.prototype.slice.call(elArr);
}

}