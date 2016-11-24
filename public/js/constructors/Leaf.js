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
  this.element.id = "leaf" + nextIdNum('.leaf');
  this.entityHeader.innerText = this.element.id;
  this.entityHeader.className = 'entityHeader';  

	let editButton = document.createElement('div')
	editButton.className = 'editButton';
	editButton.innerHTML = 'A';
	//editThis is a function defined in utils.js that creates a codemirror with the contents of this div as its starting string
	let removeButton = document.createElement('div')
	removeButton.className = 'removeButton';
	removeButton.innerHTML = 'X';

	
	this.entityHeader.appendChild(editButton);
	this.entityHeader.appendChild(removeButton);

  this.element.appendChild(this.entityHeader);
  initLeafListeners(this.element);

};

Leaf.prototype.render = function(){
  return this.element
}

