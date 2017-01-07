var remoteUpdatePos;

var socket = io();

function fireSubscribe(){
  socket.emit('subscribe',{room: location.pathname.toString()});
}
fireSubscribe();
//fireSubscribe is called when the script is first loaded and anytime the document is saved, 
//or any other action that changes the url, since url is used as the socket room name

socket.on('event', function(event){
  if(isListening(event.targetId)){
    if(event.targetId && event.type == 'mousedown'){
        document.querySelector(event.targetId).dispatchEvent(new Event('mousedown'));
    } else {
      switch(event.type){
        //triggered by doubleclicking on the background
        case 'dblclick': addTerminal(event.clientX, event.clientY); break;
        //triggered by clicking on header buttons
        // when an element is broadcasting its movements START
        case 'mousedown': remoteUpdatePos = createUpdatePos(event.clientX, event.clientY); break; 
        case 'touchstart':  remoteUpdatePos = createUpdatePos(event.clientX, event.clientY); break;
        // when an element is broadcasting its movements MOVE
        case 'mousemove': remoteUpdatePos(event.clientX, event.clientY, event.targetId); break;
        case 'touchmove': remoteUpdatePos(event.clientX, event.clientY, event.targetId); break;     // when an element is broadcasting its movements 
        // when an element is broadcasting its movements END
        case 'mouseup': remoteUpdatePos = undefined; break;
        case 'touchend': remoteUpdatePos = undefined; break;
        case 'touchcancel': remoteUpdatePos = undefined; break;
        // when a terminal is broadcasting whats being typed
        case 'keydown': handleKeystroke(event.key, event.keyCode, event.targetId, false); break;
      }
    }
  }

})

//changeMirror is defined in constructors/Codemirror.js 
socket.on('mirrorChange', (data)=>(changeMirror(data)))


socket.on('remoteRunFile', data => {
  let targetTerminal = document.getElementById(data.terminal);
  let pathname = data.path;
  let func = data.func

  let evalResult = window[func](targetTerminal, [pathname]);

	let prompt = targetTerminal.getAttribute('protoPrompt');
  //targetTerminal is the leaf element,
  //lastChild is the terminalcontainer
  //lastChild of that is the last prompt (hopefully)
  //
	targetTerminal.lastChild.lastChild.querySelector('.input').textContet = `${func} ${pathname}`

  targetTerminal.lastChild.appendChild(evalResult);
  initPrompt(targetTerminal.lastChild);
})

socket.on('filesaveResult', data => {
  //emit('filesaveResult') is fired from within customCommands, when a save result is triggered locally. The result of the post is socketized along with the id of the element that is waiting for a response 
  //updateTerminal exists in Terminal.js
  updateTerminal(data.responseText, data.requestElementId, data.aTerminalId)
})
  
function socketize(anEvent, targetId){
	//extracts useful information from any event passed as an argument. 
	//whether its key or mouse. Irrelevant props will just be undefined.
	//uses ES6 syntax to deconstruct the anEvent obj and construct the emit payload.
	let {type, key, keyCode, buttons, clientX, clientY} = anEvent;
  //targetId might be undefined for body events
  //socketize should happen in such cases
  //if there is a targetId, we have to check if broadcast is not false
  //feeling a little queezy on this one, checking if there's a target id before checking whether it should broadcast
  //I only hit this error once my menu buttons took focus from 
  if(isBroadcasting(targetId)) {
    socket.emit('event', {
      type,
      key,	
      keyCode,
      buttons,
      clientX,
      clientY,
      targetId
    });
  }
}

function isBroadcasting(targetId){
  let targetLeaf = getParentNode(document.getElementById(targetId));
  //I guess it's a little strage that I might check 'is broadcasting' on things that don't have a broadcast attribute, 
  //but this is just defaulting to broadcast if an event is socketized outside of a leaf (such as body clicks)
  let broadcastBool = targetLeaf ? targetLeaf.getAttribute('broadcast') : 'true';
  //because getAttribute returns a string, and boolean('false') -> true, so I'm using a ternary to convert a string to a bool
  return broadcastBool === 'true' ? true : false;
}
function isListening(targetId){
  let targetLeaf = getParentNode(document.getElementById(targetId));
  let broadcastBool = targetLeaf ? targetLeaf.getAttribute('listen') : 'true';
  return broadcastBool === 'true' ? true : false;
}



//called from within the POST callback in customCommands, save
function appendResult(responseText, requestElementId, aTerminalId){
  socket.emit('filesaveResult', {
    responseText,
    requestElementId,
    aTerminalId
  })
}
