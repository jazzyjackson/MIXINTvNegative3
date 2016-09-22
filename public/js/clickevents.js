document.documentElement.addEventListener('dblclick', function(event){
  if(event.target.tagName != 'DIV'){
    addTextool(event);
  }
})

document.documentElement.addEventListener('mousemove', function(event){
  event.preventDefault();
  if(event.buttons && event.target === document.activeElement && event.target.tagName === 'DIV'){
    updatePos(event, document.activeElement);
  }
})


function addTextool(event){
  var aTexTool = new TexTool(event.clientX, event.clientY);
  document.body.appendChild(aTexTool.element);
  aTexTool.element.focus();
}



function TexTool(xPos, yPos){
  this.element = document.createElement('div');
  this.element.className = 'textool';
  this.element.style.left = xPos + 'px';
  this.element.style.top = yPos + 'px';
  this.element.tabIndex = 1;
  var texToolHeader = document.createElement('h5');
  texToolHeader.innerText = Date();
  this.element.appendChild(texToolHeader);
}

function updatePos(moveEvent, element){
    var currentXpos = Number(moveEvent.target.style.left.slice(0,-2));
    var currentYpos = Number(moveEvent.target.style.top.slice(0,-2));
    element.style.left = (currentXpos + moveEvent.movementX) + 'px';
    element.style.top = (currentYpos + moveEvent.movementY) + 'px';
    console.log(event);
    console.log(currentXpos);
    console.log(currentYpos);
};

