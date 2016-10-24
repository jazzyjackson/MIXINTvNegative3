var updatePos;
var allContent = document.documentElement;

allContent.addEventListener('dblclick', function(event){
  if(event.target.tagName === 'HTML' || event.target.tagName === 'BODY'){//only addTerminal if body or higher (document where there is no body) is clicked. Top of the path is Window -> Document -
    socketize(event);
    addTerminal(event.clientX, event.clientY);
  }
});



allContent.addEventListener('mouseup', function(event){
  socketize(event);
  if(updatePos) updatePos = undefined;
  document.documentElement.removeEventListener('mousemove', handleMove);
});

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
  console.log(aTerminal.element);
  document.body.appendChild(aTerminal.element);
  aTerminal.element.focus();

}


function handleMove(event){
  if(event.buttons && updatePos){
    event.preventDefault();
		socketize(event, document.activeElement.id);
		updatePos(event.clientX, event.clientY, document.activeElement.id);
	}
};


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

function initLeafListeners(aLeafElement){
  var entityHeader = aLeafElement.getElementsByClassName('entityHeader')[0];
  entityHeader.addEventListener('mousedown', function(event){
    document.documentElement.addEventListener('mousemove', handleMove);
    socketize(event);
    updatePos = createUpdatePos(event.clientX, event.clientY, document.activeElement.id);
  })

  aLeafElement.addEventListener('touchstart', function(event){
      var convertedEvent = convertTouchToMouse(event);
      socketize(event);
      updatePos = createUpdatePos(convertedEvent.clientX, convertedEvent.clientY, document.activeElement.id);
      aLeafElement.focus();
});

  aLeafElement.addEventListener('touchmove', function(event){
    event.preventDefault();
    if(updatePos){
      var convertedEvent = convertTouchToMouse(event);
      updatePos(convertedEvent.clientX, convertedEvent.clientY, document.activeElement.id);
      socketize(event, document.activeElement.id);
    }
  });
  
  aLeafElement.addEventListener('scroll', function(event){
    event.target.firstChild.style.top = event.target.scrollTop - 10;
  })
}


function Terminal(xPos, yPos){
  Leaf.call(this, xPos, yPos);
  this.element.history = 0; //0 is most recent, negative numbers go back in time
  this.element.id = "root" + document.getElementsByClassName('terminal').length;
  this.element.className += ' terminal'; //addClass terminal to existing className
  this.element.setAttribute('prompt', 'localhost/' + this.element.id + " > ");
  this.element.childNodes[0].innerText = this.element.id;
  var prompt = document.createElement('p');
  prompt.className = 'prompt';
  prompt.innerHTML = this.element.getAttribute('prompt');
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

      var currentXpos = parseInt(element.style.left); //slicing off the last 2 characters gets rid of 'px', allowing casting to number
      var currentYpos = parseInt(element.style.top);
      element.style.left = (currentXpos + Math.floor(movementX)) + 'px'; //touch events have way too many significant digits,
      element.style.top = (currentYpos + Math.floor(movementY)) + 'px'; // flooring the number for consistency with mouse events, which report integers
  }
  return enclosedUpdatePos;
};

window.onload = function(){
  var listOfLeaves = document.getElementsByClassName('leaf');
  listOfLeaves = Array.prototype.slice.call(listOfLeaves);
  listOfLeaves.forEach(function(leaf){
    initLeafListeners(leaf)
    leaf.scrollTop = leaf.scrollHeight;
    console.log(leaf);
  });
}