function Terminal(xPos, yPos){
  Leaf.call(this, xPos, yPos);
  this.element.setAttribute('history', 0); //0 is most recent, negative numbers go back in time
  this.element.id = "root" + document.getElementsByClassName('terminal').length;
  this.element.className += ' terminal'; //addClass terminal to existing className
  this.element.setAttribute('protoPrompt', 'localhost/' + this.element.id + " > ");
  this.element.childNodes[0].innerText = this.element.id;
  let protoPrompt = this.element.getAttribute('protoPrompt');
  let prompt = document.createElement('p');
  prompt.className = 'prompt';
  prompt.innerHTML = this.element.getAttribute('protoPrompt');
  this.element.appendChild(prompt);
}

function updateTerminal(result, targetId){
  // console.log('updating target ' + targetId + ' with ' + result);
  let spanToUpdate = document.getElementById(targetId);
  spanToUpdate.innerText = result; 
  spanToUpdate.className = 'result';
}

function shiftHistory(increment){
  let history = Number(this.getAttribute('history'));
  let protoPrompt = this.getAttribute('protoPrompt');
  var listOfPrompts = this.getElementsByClassName('prompt');
  if(increment === -1 && history > 1){
    history += increment;
    this.lastChild.innerHTML = listOfPrompts[listOfPrompts.length - (1 + history)].innerHTML;
    this.setAttribute('history',history)
  } else if(increment === 1 && history < listOfPrompts.length - 1){
    history += increment;
    this.lastChild.innerHTML = listOfPrompts[listOfPrompts.length - (1 + history)].innerHTML;
    this.setAttribute('history',history)
  } else if(increment === -1 && history == 1){
    this.lastChild.innerHTML = protoPrompt;
    history += increment;
    this.setAttribute('history',history)

  }
}


function handleKeystroke(aKeystroke, aKeyCode, aTarget, isLocal){
    var terminal = document.getElementById(aTarget);
    if(aKeystroke == 'Backspace'){
      terminal.lastChild.innerHTML = terminal.lastChild.innerHTML.slice(0, -1)
    } else if( (aKeyCode >= 48 && aKeyCode <= 90) || (aKeyCode >= 186 && aKeyCode <= 222) || (aKeystroke == " ")) {
      terminal.lastChild.innerHTML += aKeystroke;
    } else if(aKeystroke == 'Enter'){
      handleInput(terminal, isLocal)
    } else if(aKeystroke == 'ArrowUp'){
      shiftHistory.call(terminal, 1); //back in time, maxxing out at length of child nodes.
    } else if(aKeystroke == 'ArrowDown'){
      shiftHistory.call(terminal, -1); //forward in time, maxxing out at 0
    }
    terminal.scrollTop = terminal.scrollHeight;
}

// for some commands it is necessary to know if the keystroke was local or remote. isLocal carries this info.
function handleInput(aTerminal,isLocal){
    aTerminal.history = 0;
    var query = aTerminal.lastChild.innerHTML.split('&gt;')[1];
    //Trim whitespace, split on space, check if that first result is in the list of keywords. If it is, return (or call) the property of that name. Else, run the whole phrase as a query
    var result;
		var potentialCommand = query.trim().split(' ')[0]; //even for empty strings or strings with no spaces, the result of trim().split() will be an array with at least one element. 
		if(customCommands[potentialCommand]){
      let potentialArguments = query.trim().split(' ').slice(1); // returns an empty array if no args, otherwise, arguments are passed as an array
      console.log(potentialArguments)
    	result = customCommands[potentialCommand](aTerminal,potentialArguments,isLocal); //calls the function, should return an Element
		} else {
      result = evaluate(aTerminal, query); 
		}

    aTerminal.appendChild(result);
    result.className += " result";

    initPrompt(aTerminal);
    
}

function initPrompt(aTerminal){
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

document.documentElement.addEventListener('keydown', function(event){
  //IF you're typing in a terminal, AND you're not holding down the CTRL key.
  if(document.activeElement.className.indexOf('terminal') !== -1 && !event.ctrlKey){
    event.preventDefault(); //I don't remember why this is here.
    var terminal = document.activeElement;
	  socketize(event, terminal.id);
    handleKeystroke(event.key, event.keyCode, terminal.id, true);
  }
});

document.documentElement.addEventListener('dblclick', event => {
  if(event.target.tagName === 'HTML' || event.target.tagName === 'BODY'){//only addTerminal if body or higher (document where there is no body) is clicked. Top of the path is Window -> Document -
    socketize(event);
    addTerminal(event.clientX, event.clientY);
  }
});

function addTerminal(posX, posY){
  var aTerminal = new Terminal(posX, posY);
  document.body.appendChild(aTerminal.element);
  aTerminal.element.focus();
}