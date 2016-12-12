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

  let newDiv = document.createElement.bind(document, 'div');

	let editButton = newDiv();
	let removeButton = newDiv();
	let saveButton = newDiv();
	let broadcastButton = newDiv();
  let listenButton = newDiv();
	editButton.className = 'editButton';
	removeButton.className = 'removeButton';
	saveButton.className = 'saveButton';
	broadcastButton.className = 'broadcastButton';
	listenButton.className = 'listenButton';
	
	this.entityHeader.appendChild(editButton);
	this.entityHeader.appendChild(removeButton);
	this.entityHeader.appendChild(saveButton);
	this.entityHeader.appendChild(broadcastButton);
	this.entityHeader.appendChild(listenButton);

  this.element.appendChild(this.entityHeader);
  this.element.setAttribute('listen', 'true')
  this.element.setAttribute('broadcast', 'true')
  initLeafListeners(this.element);

};

Leaf.prototype.render = function(){
  return this.element
}

