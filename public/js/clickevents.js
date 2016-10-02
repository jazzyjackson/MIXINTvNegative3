var updatePos;
var allContent = document.documentElement;

allContent.addEventListener('dblclick', function(event){
  socketize(event);
  if(document.activeElement.className != 'terminal'){ //only addTerminal if body or higher (document where there is no body) is clicked. Top of the path is Window -> Document -
    addTerminal(event.clientX, event.clientY);
  }
})


allContent.addEventListener('mouseup', function(event){
  socketize(event);
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


function addTerminal(posX, posY){
  var aTerminal = new Terminal(posX, posY);
  document.body.appendChild(aTerminal.element);
  aTerminal.element.focus();
  console.log(aTerminal.element);
}

function Circle(xPos,yPos,radius,color){
  Leaf.call(this, xPos, yPos);
  
  var defaultRadius = 50;
  var defaultColor = 'rgba(' + an8bitrandom() + ',' + an8bitrandom() + ',' + an8bitrandom() + ',' + Math.random() + ')';
  this.element.className = 'circle';
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
}


function Leaf(xPos, yPos){
  this.element = document.createElement('div');
  this.element.style.left = xPos + 'px';
  this.element.style.top = yPos + 'px';
  this.element.tabIndex = 1;
  this.element.style.position = 'absolute';

  this.element.addEventListener('mousemove', function(event){
    event.preventDefault();
    if(event.buttons && updatePos){
      socketize(event, document.activeElement.id);
      updatePos(event.clientX, event.clientY, document.activeElement.id);
    }
  })

  this.element.addEventListener('mousedown', function(event){
    socketize(event);
    updatePos = createUpdatePos(event.clientX, event.clientY, document.activeElement.id);
  })

  this.element.addEventListener('touchstart', function(event){
      var convertedEvent = convertTouchToMouse(event);
      socketize(event);
      updatePos = createUpdatePos(convertedEvent.clientX, convertedEvent.clientY, document.activeElement.id);
      this.focus();
  });

  this.element.addEventListener('touchmove', function(event){
    event.preventDefault();
    if(updatePos){
      var convertedEvent = convertTouchToMouse(event);
      updatePos(convertedEvent.clientX, convertedEvent.clientY, document.activeElement.id);
      socketize(event, document.activeElement.id);
    }
  });
  
  this.element.addEventListener('scroll', function(event){
    console.log(event);
    console.log(event.target.scrollHeight - event.target.clientHeight);
    event.target.firstChild.style.top = event.target.scrollTop - 10;
  })

}


function Terminal(xPos, yPos){
  Leaf.call(this, xPos, yPos);
  this.element.history = 0; //0 is most recent, negative numbers go back in time
  this.element.id = "root" + document.getElementsByTagName('DIV').length;
  this.element.className = 'terminal';
  this.element.prompt = 'localhost/' + this.element.id + " > ";
  var terminalHeader = document.createElement('h5');
  terminalHeader.innerText = "root";
  var prompt = document.createElement('p');
  prompt.className = 'prompt';
  prompt.innerHTML = this.element.prompt;
  this.element.appendChild(terminalHeader);
  this.element.appendChild(prompt);
  this.element.shiftHistory = function(increment){
      console.log(this.history);
      var listOfPrompts = this.getElementsByClassName('prompt');
      if(increment === -1 && this.history > 1){
        this.history += increment;
        this.lastChild.innerHTML = listOfPrompts[listOfPrompts.length - (1 + this.history)].innerHTML;
      } else if(increment === 1 && this.history < listOfPrompts.length - 1){
        console.log(this.history, listOfPrompts.length);
        this.history += increment;
        this.lastChild.innerHTML = listOfPrompts[listOfPrompts.length - (1 + this.history)].innerHTML;
      } else if(increment === -1 && this.history == 1){
        this.lastChild.innerHTML = this.prompt;
        this.history += increment;
      }
    }
}




function createUpdatePos(clientX, clientY){
  var theLastX = clientX;
  var theLastY = clientY;
  var enclosedUpdatePos = function(clientX, clientY, elementId){
      element = document.getElementById(elementId);
      
      var movementX = clientX - theLastX;
      var movementY = clientY - theLastY;
      theLastX = clientX;
      theLastY = clientY;

      //theLastY === undefined ? theLastY = moveEvent.clientY : moveEvent.clientX - theLastX;
      var currentXpos = Number(element.style.left.slice(0,-2)); //slicing off the last 2 characters gets rid of 'px', allowing casting to number
      var currentYpos = Number(element.style.top.slice(0,-2));
      element.style.left = (currentXpos + Math.floor(movementX)) + 'px'; //touch events have way too many significant digits,
      element.style.top = (currentYpos + Math.floor(movementY)) + 'px'; // flooring the number for consistency with mouse events, which report integers


      if(currentYpos == 0){ console.log(event);}
  }
    //  console.log(event);
    //  console.log(currentXpos);
    //  console.log(currentYpos);
   // console.log(movementX, movementY);
  return enclosedUpdatePos;
};

