function Leaf(xPos, yPos, width, height){
  xPos || (xPos = 50);
  yPos || (yPos = 50);
  width || (width = 400);
  height || (height = 300);


  this.element = document.createElement('div');

  this.element.style.left = xPos + 'px';
  this.element.style.top = yPos + 'px';  
  this.element.style.width = width + 'px';
  this.element.style.height = height + 'px';
  this.element.tabIndex = 1;
  this.element.style.position = 'absolute';
  this.element.className = 'leaf';

  this.element.style.background = 'white';

  this.entityHeader = document.createElement('h3');
  this.element.id = "leaf" + document.getElementsByClassName('leaf').length;
  this.entityHeader.innerText = this.element.id;
  this.entityHeader.className = 'entityHeader';  
  this.element.appendChild(this.entityHeader);
  initLeafListeners(this.element);

}

Leaf.prototype.render = function(){
  return this.element
}

