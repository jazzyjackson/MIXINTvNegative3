var remoteUpdatePos;

var socket = io(window.location.href);
socket.on('event', function(event){
  switch(event.type){
    case 'dblclick': addTerminal(event.clientX, event.clientY)
        
    case 'mouseup': remoteUpdatePos = undefined;
    case 'touchend': remoteUpdatePos = undefined;
    case 'touchcancel': remoteUpdatePos = undefined;
        
    case 'mousedown': remoteUpdatePos = createUpdatePos(event.clientX, event.clientY);
    case 'touchstart':  remoteUpdatePos = createUpdatePos(event.clientX, event.clientY);
        
    case 'mousemove': remoteUpdatePos(event.clientX, event.clientY, event.targetId);
    case 'touchmove': remoteUpdatePos(event.clientX, event.clientY, event.targetId);   
  }
});
  
function socketize(anEvent, optActiveElement){
  
    if(anEvent.__proto__.toString() === "[object MouseEvent]"){};
    
    socket.emit('event', {
      type: anEvent.type,
      buttons: anEvent.buttons,
      clientX: anEvent.clientX,
      clientY: anEvent.clientY,
      targetId: optActiveElement
    })
}