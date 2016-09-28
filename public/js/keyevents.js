document.documentElement.addEventListener('keydown', function(){
  if(document.activeElement.tagName === 'DIV'){
    if(event.key == 'Backspace'){
      document.activeElement.lastChild.innerHTML = document.activeElement.lastChild.innerHTML.slice(0, -1)
    } else if((event.keyCode >= 48 && event.keyCode <= 90)||(event.keyCode >= 186 && event.keyCode <= 222)||(event.code == "Space")) {
      document.activeElement.lastChild.innerHTML += event.key;
    } else if(event.key == 'Enter'){
      handleInput(document.activeElement)
    }
  }
});

function handleInput(aTerminal){
    var query = document.activeElement.lastChild.innerHTML.split('&gt;')[1];
    
    console.log(query);
    
    var result = document.createElement('p');
    
    try {
      result.innerHTML = eval(query);
    } catch(e) {
      result.innerHTML = e;
    }
    
    document.activeElement.appendChild(result);
    var prompt = document.createElement('p');
    prompt.innerHTML = document.activeElement.prompt;
    document.activeElement.appendChild(prompt);
    
    document.activeElement.scrollTop = document.activeElement.scrollHeight;
    
}


  /*
  if(event.target.tagName == 'DIV' && editMode === false){
    if(event.key == 'c'){addNewLeafTo(event);}
    if(event.key == 'ArrowUp' || event.key == 'k'){
      if(event.target.previousSibling !== null) event.target.previousSibling.focus();
      else(event.target.parentNode.lastChild.focus());
    }
    if(event.key == 'ArrowDown' || event.key == 'j'){
      if(event.target.nextSibling !== null) event.target.nextSibling.focus();
      else(event.target.parentNode.childNodes[0].focus());
    }
    if(event.key == 'ArrowLeft' || event.key == 'h'){
      if(event.target.parentNode.tagName !== 'BODY') event.target.parentNode.focus();
    }
    if(event.key == 'ArrowRight' || event.key == 'l'){
      if(event.target.childNodes[0] !== undefined) event.target.childNodes[0].focus();
    }
    if(event.key == 'Enter'){
      activeElement = event.target;
      //      console.log(activeElement);
      swapTextforSpan(event);
    }

  }
  if(event.key == 'Escape'){
    console.log(event);
    editMode = false;
    activeElement = null;
  }
  */
