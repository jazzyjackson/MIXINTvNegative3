var remoteUpdatePos;

var socket = io(window.location.href);
socket.on('event', function(event){
  console.log(event);
  switch(event.type){

    case 'dblclick': addTerminal(event.clientX, event.clientY); break;
        
    case 'mouseup': remoteUpdatePos = undefined; break;
    case 'touchend': remoteUpdatePos = undefined; break;
    case 'touchcancel': remoteUpdatePos = undefined; break;
        
    case 'mousedown': remoteUpdatePos = createUpdatePos(event.clientX, event.clientY); break; 
    case 'touchstart':  remoteUpdatePos = createUpdatePos(event.clientX, event.clientY); break;
        
    case 'mousemove': remoteUpdatePos(event.clientX, event.clientY, event.targetId); break;
    case 'touchmove': remoteUpdatePos(event.clientX, event.clientY, event.targetId); break; 
	case 'keydown': handleKeystroke(event.key, event.keyCode, event.targetId); break;
  }

});
  
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


console.log(document.getElementsByTagName('script'));
