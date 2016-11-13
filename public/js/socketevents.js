var remoteUpdatePos;

var socket = io();

function fireSubscribe(){
  socket.emit('subscribe',{room: location.pathname.toString()});
}
fireSubscribe();
//fireSubscribe is called when the script is first loaded and anytime the document is saved, 
//or any other action that changes the url, since url is used as the socket room name

function fireClick(aButtonId, aNiq){
	socket.emit('clickThis', {id: aButtonId, aNiq })
}

socket.on('clickThis', aButtonObj => {
	addSection(null, aButtonObj.aNiq);
})

socket.on('event', function(event){
  switch(event.type){

    case 'dblclick': addTerminal(event.clientX, event.clientY);
        
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

socket.on('revertEditor', editorIdObj => {
	console.log("hit! " + editorIdObj.aMirrorContainerId)
	let theContainer = document.getElementById(editorIdObj.aMirrorContainerId);
	revertTempEditor(theContainer);
})

function fireRevert(aMirrorContainerId){
	console.log("firing! " + aMirrorContainerId);
	socket.emit('revertEditor', {aMirrorContainerId})
};

socket.on('remoteRunFile', data => {
  let targetTerminal = document.getElementById(data.terminal);
  let pathname = data.path;
  let func = data.func

  let evalResult = window[func](targetTerminal, [pathname]);

	let prompt = targetTerminal.getAttribute('protoPrompt');
	targetTerminal.lastChild.innerText = `${prompt} ${func} ${pathname}`

  targetTerminal.appendChild(evalResult);
  initPrompt(targetTerminal);
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

  socket.emit('event', {
    type,
	  key,	
	  keyCode,
    buttons,
    clientX,
    clientY,
    targetId
  })
}



//called from within the POST callback in customCommands, save
function appendResult(responseText, requestElementId, aTerminalId){
  socket.emit('filesaveResult', {
    responseText,
    requestElementId,
    aTerminalId
  })
}
