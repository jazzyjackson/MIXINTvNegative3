document.documentElement.addEventListener('keydown', function(event){
  console.log(event);
  //IF you're typing in a terminal, AND you're not holding down the CTRL key.
  if(document.activeElement.className.indexOf('terminal') !== -1 && !event.ctrlKey){
    event.preventDefault(); //I don't remember why this is here.
    var terminal = document.activeElement;
	  socketize(event, terminal.id);
    handleKeystroke(event.key, event.keyCode, terminal.id);
  }
});

function handleKeystroke(aKeystroke, aKeyCode, aTarget){
    var terminal = document.getElementById(aTarget);
    if(aKeystroke == 'Backspace'){
      terminal.lastChild.innerHTML = terminal.lastChild.innerHTML.slice(0, -1)
    } else if( (aKeyCode >= 48 && aKeyCode <= 90) || (aKeyCode >= 186 && aKeyCode <= 222) || (aKeystroke == " ")) {
      terminal.lastChild.innerHTML += aKeystroke;
    } else if(aKeystroke == 'Enter'){
      handleInput(terminal)
    } else if(aKeystroke == 'ArrowUp'){
      terminal.shiftHistory(1); //back in time, maxxing out at length of child nodes.
    } else if(aKeystroke == 'ArrowDown'){
      terminal.shiftHistory(-1); //forward in time, maxxing out at 0
    }
    terminal.scrollTop = terminal.scrollHeight;

}

function handleInput(aTerminal){
    aTerminal.history = 0;
    var query = aTerminal.lastChild.innerHTML.split('&gt;')[1];
    //Trim whitespace, split on space, check if that first result is in the list of keywords. If it is, return (or call) the property of that name. Else, run the whole phrase as a query
    var result;
		var potentialCommand = query.trim().split(' ')[0]; //even for empty strings or strings with no spaces, the result of trim().split() will be an array with at least one element. 
		if(customCommands[potentialCommand]){
      potentialArguments = query.trim().split(' ').slice(1); // returns an empty array if no args, otherwise, arguments are passed as an array
			result = customCommands[potentialCommand](aTerminal,potentialArguments);
		} else {
      result = evaluate(aTerminal, query); 
		}

    aTerminal.appendChild(result);
    result.className += " result";
    var prompt = document.createElement('p');
    prompt.className = "prompt";
    prompt.innerHTML = aTerminal.getAttribute('protoPrompt');
    aTerminal.appendChild(prompt);
    aTerminal.scrollTop = aTerminal.scrollHeight;
    
}

function evaluate(aTerminal, aQuery){
		var result = createResult();
		result.className = 'result';
    try {
      var localEval = function(){return eval(aQuery)}; 
      result.innerHTML = localEval.call(aTerminal);
			return result;
    } catch(e) {
			console.log(e);
			result.innerHTML = e;
			return result;
    }
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
