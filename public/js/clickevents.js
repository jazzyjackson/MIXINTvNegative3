var updatePos;

var allContent = document.documentElement;

allContent.addEventListener('dblclick', function(event){
  if(event.path.length <= 4){ //only addTexTool if body or higher (document where there is no body) is clicked
    addTextool(event);
  }
})


allContent.addEventListener('mouseup', function(event){
  if(updatePos) updatePos = undefined;

})

allContent.addEventListener('touchcancel', function(event){
    updatePos = undefined;

});
allContent.addEventListener('touchend', function(event){
    updatePos = undefined;

});

function convertTouchToMouse(event){
  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  return event;
}


function addTextool(event){
  var aTexTool = new TexTool(event.clientX, event.clientY);
  document.body.appendChild(aTexTool.element);
  aTexTool.element.focus();
  console.log(aTexTool.element);
}



function TexTool(xPos, yPos){
  this.element = document.createElement('div');
  this.element.className = 'textool';
  this.element.style.left = xPos + 'px';
  this.element.style.top = yPos + 'px';
  this.element.tabIndex = 1;

  this.element.prompt = "root@localhost > ";

  var texToolHeader = document.createElement('h5');
  texToolHeader.innerText = Date();
  var prompt = document.createElement('p');
  prompt.innerHTML = this.element.prompt;
  this.element.appendChild(texToolHeader);
  this.element.appendChild(prompt);


  this.element.addEventListener('mousemove', function(event){
    event.preventDefault();
    if(event.buttons && updatePos){
      updatePos(event, document.activeElement);
    }
  })

  this.element.addEventListener('mousedown', function(event){
    updatePos = createUpdatePos(event.clientX, event.clientY);
  })





  this.element.addEventListener('touchstart', function(event){
    updatePos = createUpdatePos(convertTouchToMouse(event));
    console.log(event);
    this.focus();
  });

  this.element.addEventListener('touchmove', function(event){
    event.preventDefault();
    if(updatePos,document.activeElement){
      updatePos(convertTouchToMouse(event), document.activeElement);
    }

  });

}


function createUpdatePos(event){
  var theLastX = event.clientX;
  var theLastY = event.clientY;
  var enclosedUpdatePos = function(moveEvent, element){

      var movementX = moveEvent.clientX - theLastX;
      var movementY = moveEvent.clientY - theLastY;
      theLastX = moveEvent.clientX;
      theLastY = moveEvent.clientY;

      theLastY === undefined ? theLastY = moveEvent.clientY : moveEvent.clientX - theLastX;
      var currentXpos = Number(element.style.left.slice(0,-2)); //slicing off the last 2 characters gets rid of 'px', allowing casting to number
      var currentYpos = Number(element.style.top.slice(0,-2));
      element.style.left = (currentXpos + Math.floor(movementX)) + 'px';
      element.style.top = (currentYpos + Math.floor(movementY)) + 'px';


      if(currentYpos == 0){ console.log(event);}
    //  console.log(event);
    //  console.log(currentXpos);
    //  console.log(currentYpos);
   // console.log(movementX, movementY);
  }
  return enclosedUpdatePos;
};

function touchToMovement(touchEvent, element){}; //touch events don't have movementX / Y properties, just current X Y position
                                                 //should have a touch history maybe? Something better than global variables to track last touch
