/* It's necessary to place mouse move and mouse touch events on the document 
 * otherwise if the element doesn't keep the pace and falls out from under the cursor,
 * the events would stop fires.
 * This way, 
 * movements continue to update until mouse/finger is lifted 

 * utils.js depends on socketevents.js depends on socket.io.js

*/
var updatePos;
var allContent = document.documentElement;

allContent.addEventListener('mousedown', function(event){
  //Neat! On mousedown, the activeElement is the LAST thing that was clicked on, not the thing that mousedown just hit.
  if((event.target.tagName === 'HTML' || event.target.tagName === 'BODY') && event.shiftKey){
    console.log(event.clientX, event.clientY, document.activeElement.id)
    document.activeElement = document.body;
    document.documentElement.addEventListener('mousemove', handleMove);
    socketize(event);
    updatePos = createUpdatePos(event.clientX, event.clientY, document.activeElement.id);
  }
})

document.documentElement.addEventListener('dblclick', event => {
  if(event.target.tagName === 'HTML' || event.target.tagName === 'BODY'){//only addTerminal if body or higher (document where there is no body) is clicked. Top of the path is Window -> Document -
    socketize(event);
    addTerminal(event.clientX - parseInt(document.body.style.left), event.clientY - parseInt(document.body.style.top));
  }
});

function addTerminal(posX, posY){
  var aTerminal = new Terminal(posX, posY);
  document.body.appendChild(aTerminal.element);
  aTerminal.element.focus();
}


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

  document.body.style.height = innerHeight;
  document.body.style.width = innerWidth;

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

function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0 Byte';
   var k = 1000; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function shiftxPx(event){
  //shift pixels will be called when an arrow key and shift are pressed, so I'm expecting a key event and will switch based on key'
  let bodyStyle = document.body.style
  switch(event.code){
    case "ArrowUp": bodyStyle.top = parseInt(bodyStyle.top) + parseInt(bodyStyle.height) + 'px'; break;
    case "ArrowRight": bodyStyle.left = parseInt(bodyStyle.left) - parseInt(bodyStyle.width) + 'px'; break;
    case "ArrowDown": bodyStyle.top = parseInt(bodyStyle.top) - parseInt(bodyStyle.height) + 'px'; break;
    case "ArrowLeft":  bodyStyle.left = parseInt(bodyStyle.left) + parseInt(bodyStyle.width) + 'px'; break;
    case "Digit0": bodyStyle.left = 0; bodyStyle.top = 0; break;
  }
}

allContent.addEventListener('keydown', event => {
    if(["ArrowUp","ArrowRight","ArrowDown","ArrowLeft","Digit0"].includes(event.code) && event.shiftKey){
      console.log('shifting...')
      shiftxPx(event)
    }
})