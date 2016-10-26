function Circle(xPos,yPos,radius,color){
  Leaf.call(this, xPos, yPos);
  
  var defaultRadius = 50;
  var defaultColor = 'rgba(' + an8bitrandom() + ',' + an8bitrandom() + ',' + an8bitrandom() + ',' + Math.random() + ')';
  this.element.className += ' circle'; //addClassName circle to existing
  var diameter = radius ? (radius * 2) : (defaultRadius * 2);
  diameter = diameter + "px"
  var background = color ? color : defaultColor;
  
  this.element.style.height = diameter;
  this.element.style.width = diameter;
  this.element.style.borderRadius = diameter;
  this.element.style.background = background;
  this.element.id = 'circle' + document.getElementsByClassName('circle').length;
  function an8bitrandom(){
    return Math.floor(Math.random() * 255);
  }
  var header = this.element.getElementsByClassName('entityHeader')[0];
  header.innerText = this.element.id;
  this.render = function(){
    return this.element;
  }
}
