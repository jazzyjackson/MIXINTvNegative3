document.documentElement.addEventListener('dblclick', function(event){
  if(event.target.tagName != 'DIV'){
    addTextool(event);
  }
})

document.documentElement.addEventListener('mousemove', function(event){
  event.preventDefault();
  if(event.buttons && event.target === document.activeElement){
    var currentXpos = Number(event.target.style.left.slice(0,-2));
    var currentYpos = Number(event.target.style.top.slice(0,-2));
    event.target.style.left = (currentXpos + event.movementX) + 'px';
    event.target.style.top = (currentYpos + event.movementY) + 'px';
    console.log(event);
    console.log(currentXpos);
    console.log(currentYpos);
  }
})


function addTextool(event){
  var aTexTool = new TexTool(event.clientX, event.clientY);
  document.body.appendChild(aTexTool.element);
}



function TexTool(xPos, yPos){
  this.element = document.createElement('div');
  this.element.className = 'textool';
  this.element.style.left = xPos + 'px';
  this.element.style.top = yPos + 'px';
  this.element.tabIndex = 1;
  this.element.focus();
  var texToolHeader = document.createElement('h5');
  texToolHeader.innerText = Date();
  this.element.appendChild(texToolHeader);
}

