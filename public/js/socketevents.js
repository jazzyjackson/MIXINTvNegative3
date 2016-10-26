var remoteUpdatePos;

var socket = io(window.location.host);

socket.on('event', function(event){
  switch(event.type){

    case 'dblclick': addTerminal(event.clientX, event.clientY); break;
        
    case 'mouseup': remoteUpdatePos = undefined; break;
    case 'touchend': remoteUpdatePos = undefined; break;
    case 'touchcancel': remoteUpdatePos = undefined; break;
        
    case 'mousedown': remoteUpdatePos = createUpdatePos(event.clientX, event.clientY); break; 
    case 'touchstart':  remoteUpdatePos = createUpdatePos(event.clientX, event.clientY); break;
        
    case 'mousemove': remoteUpdatePos(event.clientX, event.clientY, event.targetId); break;
    case 'touchmove': remoteUpdatePos(event.clientX, event.clientY, event.targetId); break; 
    case 'keydown': handleKeystroke(event.key, event.keyCode, event.targetId, false); break;
  }
})

socket.on('remoteRunFile', data => {
  let targetTerminal = document.getElementById(data.terminal);
  let pathname = data.path;

  let evalResult = window[data.func](targetTerminal, [pathname]);

	let prompt = targetTerminal.getAttribute('protoPrompt');
	targetTerminal.lastChild.innerText = `${prompt} ls ${pathname}`

  targetTerminal.appendChild(evalResult);
  initPrompt(targetTerminal);
})

socket.on('filesaveResult', data => {
  updateTerminal(data.responseText, data.aTarget)
})
  
function socketize(anEvent, optActiveElement){
  socket.emit('event', {
    type: anEvent.type,
	  key: anEvent.key,	
	  keyCode: anEvent.keyCode,
    buttons: anEvent.buttons,
    clientX: anEvent.clientX,
    clientY: anEvent.clientY,
    targetId: optActiveElement
  })
}

//called from within the POST callback in customCommands, save
function appendResult(responseText, aTarget){
  socket.emit('filesaveResult', {
    responseText,
    aTarget
  })
}