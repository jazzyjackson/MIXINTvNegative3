document.documentElement.addEventListener('keydown', function(event){
  if(document.activeElement.className === 'terminal'){
    event.preventDefault();
    var terminal = document.activeElement;
	socketize(event, terminal.id);
    handleKeystroke(event.key, event.keyCode, terminal.id);
  }
});

function handleKeystroke(aKeystroke, aKeyCode, aTarget){
	var terminal = document.getElementById(aTarget);
    if(aKeystroke== 'Backspace'){
      terminal.lastChild.innerHTML = terminal.lastChild.innerHTML.slice(0, -1)
    } else if((aKeyCode>= 48 && aKeyCode<= 90)||(aKeyCode>= 186 && aKeyCode<= 222)||(aKeystroke == " ")) {
      terminal.lastChild.innerHTML += aKeystroke;
    } else if(aKeystroke== 'Enter'){
      handleInput(terminal)
    } else if(aKeystroke== 'ArrowUp'){
      event.preventDefault();
      terminal.shiftHistory(1); //back in time, maxxing out at length of child nodes.
    } else if(aKeystroke== 'ArrowDown'){
      terminal.shiftHistory(-1); //forward in time, maxxing out at 0
    }
}

function handleInput(aTerminal){
    aTerminal.history = 0;
    console.log(aTerminal);
    var query = document.activeElement.lastChild.innerHTML.split('&gt;')[1];
    console.log(query);
    var result = document.createElement('p');
    result.className = "result";
    try {
      var localEval = function(){return eval(query)}; 
      result.innerHTML = localEval.call(document.activeElement);
    } catch(e) {
      result.innerHTML = e;
    }
    
    document.activeElement.appendChild(result);
    var prompt = document.createElement('p');
    prompt.className = "prompt";
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
