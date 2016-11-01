function Leaf(xPos, yPos){
  xPos || (xPos = 50);
  yPos || (yPos = 50);

  this.element = document.createElement('div');

  this.element.style.left = xPos + 'px';
  this.element.style.top = yPos + 'px';
  this.element.tabIndex = 1;
  this.element.style.position = 'absolute';
  this.element.className = 'leaf';

  var entityHeader = document.createElement('h3');
  entityHeader.innerText = "header was not set in constructor";
  entityHeader.className = 'entityHeader';
  this.element.appendChild(entityHeader);
  initLeafListeners(this.element);

}

