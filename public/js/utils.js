/* It's necessary to place mouse move and mouse touch events on the document 
 * otherwise if the element doesn't keep the pace and falls out from under the cursor,
 * the events would stop fires.
 * This way, 
 * movements continue to update until mouse/finger is lifted 

 * utils.js depends on socketevents.js depends on socket.io.js

*/
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

window.addEventListener('load', ()=>{
  //reattach all the click and drag listeners to all elements
  var listOfLeaves = Array.from(document.getElementsByClassName('leaf'));
  listOfLeaves.forEach(leaf => {
    initLeafListeners(leaf)
    leaf.scrollTop = leaf.scrollHeight;
    // console.log(leaf);
  });
  //reattach eventlisteners to any directory folders inside the terminals
  var listOfDirContainers = Array.from(document.getElementsByClassName('directoryContainer'));
  listOfDirContainers.forEach(aDirectoryContainer => {
    addDblClickListeners(aDirectoryContainer)
  })

  //if there are codemirrors, re-instantiate them with fromTextArea
  //if codemirrors weren't used, then codemirror.js won't be on the DOM and CodeMirror will be undefiend
})

document.documentElement.addEventListener('keydown',(event)=>{
  if(event.ctrlKey && event.key == 's'){
    event.preventDefault();
    try {
    saveShortcut();
    } catch (e){
      console.log(e);
    }
  }
})

function saveShortcut() { 
  //Ugh. Ugly workaround if you hit ctrl s when a codemirror is focused. Before saving, 
  //grab elements with classname CodeMirror-focused and remove it from classes
  let possiblyFocusedCM = document.getElementsByClassName('CodeMirror-focused')[0];
  possiblyFocusedCM && (possiblyFocusedCM.className = possiblyFocusedCM.className.replace(/CodeMirror-focused/,''));
  let termArr = Array.from(document.getElementsByClassName('terminal')); 
  termArr = termArr.filter(each => window.location.pathname.includes(each.id)); 
  terminalMatchesPath = termArr[0]; 
  save(terminalMatchesPath, [], { isLocal: true }) 
}