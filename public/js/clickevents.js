/* It's necessary to place mouse move and mouse touch events on the document 
 * otherwise if the element doesn't keep the pace and falls out from under the cursor,
 * the events would stop fires.
 * This way, movements continue to update until mouse/finger is lifted */

//
var updatePos;
var allContent = document.documentElement;


allContent.addEventListener('mouseup', event => {
  socketize(event);
  if(updatePos) updatePos = undefined;
  document.documentElement.removeEventListener('mousemove', handleMove);
});

allContent.addEventListener('touchcancel', event => updatePos = undefined);
allContent.addEventListener('touchend',  event => updatePos = undefined);

function convertTouchToMouse(event){
  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  return event;
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