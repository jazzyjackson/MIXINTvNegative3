
function Terminal(xPos, yPos){
  Leaf.call(this, xPos, yPos);
  this.element.setAttribute('history', 0); //0 is most recent, negative numbers go back in time
  //check for a document name, pulling out just the word characters without surrounding punctuation
  let aPotentialName = location.pathname
  aPotentialName = aPotentialName.match(/\/\w+\.|\/\w+$/);
  aPotentialName = aPotentialName && aPotentialName[0].match(/\w+/);
  aPotentialName = aPotentialName && aPotentialName[0];
  //if the document has a name AND there is NOT already a terminal with that name
  if(aPotentialName && !document.getElementById(aPotentialName)){
    this.element.id = aPotentialName;
  } else {
    this.element.id = "root" + nextIdNum('.terminal');
  }
  this.element.className += ' terminal'; //addClass terminal to existing className
  this.element.setAttribute('protoPrompt', 'localhost/' + this.element.id);
	//not sure if I can rely on the first child of the header to be the text Node, maybe there's a more generalizable way to get to the text node
  // let entityHeader = this.element.querySelector('.entityHeader')
  let thisHeader = this.element.querySelector('.entityHeader')
  let thisTitle = thisHeader.querySelector('.headerTitle')
  thisTitle.textContent = this.element.id;
  
  thisHeader.querySelector('.editButton').parentElement.remove();
  thisHeader.querySelector('.saveButton').parentElement.remove();

  let protoPrompt = this.element.getAttribute('protoPrompt');
  let terminalContainer = document.createElement('div');
  terminalContainer.className = "terminalContainer";
  this.element.appendChild(terminalContainer);
  initPrompt(terminalContainer);
}

Terminal.prototype.render = function(){
  return this.element;
}

function updateTerminal(result, requestElementId, aTerminalId){
  //boolean guards are necessary because the socket.emit(fileSaveUpdate is invoked whether the command save was run or ctrl s was hit, and when ctrl s is hit, a new element is not appended to the terminal.)  
  let spanToUpdate = document.getElementById(requestElementId);
  //if the spantoupdate exists, set its innerText to the payload of the fileSaveResult socket emitter.
  spanToUpdate && (spanToUpdate.innerText = result);

  window.history.pushState({},null,`http://${window.location.host}/savedTrees/${aTerminalId}.html${location.search}`)
  fireSubscribe();
  spanToUpdate && (spanToUpdate.className = 'result');
}

function shiftHistory(increment){
  let history = Number(this.getAttribute('history'));
  let protoPrompt = this.getAttribute('protoPrompt');
  var listOfPrompts = Array.from(this.getElementsByClassName('promptContainer'));
  //When I press up or down, I want to make the input.textContent of the last promptContainer
  //be the input.textContent of a previous promptContainer
  //update history if the new number is >= 0
  let lastPromptInput = listOfPrompts[listOfPrompts.length - 1].querySelector('.input');
  if(history === 0){
    this.tempHistoryZero = lastPromptInput.textContent;
  }
  if( history + increment >= 0 && history + increment < listOfPrompts.length) history += increment;
  this.setAttribute('history', history)

  if(history === 0){
    lastPromptInput.textContent = this.tempHistoryZero;
  } else {
    lastPromptInput.textContent = listOfPrompts[listOfPrompts.length - (history + 1)].querySelector('.input').textContent;
  }


  // if(increment === -1 && history > 1){
  //   history += increment;
  //   this.lastChild.innerHTML = listOfPrompts[listOfPrompts.length - (1 + history)].innerHTML;
  //   this.setAttribute('history',history)
  // } else if(increment === 1 && history < listOfPrompts.length - 1){
  //   history += increment;
  //   this.lastChild.innerHTML = listOfPrompts[listOfPrompts.length - (1 + history)].innerHTML;
  //   this.setAttribute('history',history)
  // } else if(increment === -1 && history == 1){
  //   this.lastChild.innerHTML = protoPrompt;
  //   history += increment;
  //   this.setAttribute('history',history)
  //}
}


function handleKeystroke(aKeystroke, aKeyCode, aTarget, options){
    let terminal = document.getElementById(aTarget).querySelector('.terminalContainer');
    let lastinput = terminal.lastChild.querySelector('.input');
    if(aKeystroke == 'Backspace'){
      lastinput.innerHTML = lastinput.innerHTML.slice(0, -1)
    } else if( (aKeyCode >= 48 && aKeyCode <= 90) || (aKeyCode >= 186 && aKeyCode <= 222) || (aKeystroke == " ")) {
      lastinput.innerHTML += aKeystroke;
    } else if(aKeystroke == 'Enter'){
      handleInput(terminal, options)
    } else if(aKeystroke == 'ArrowUp'){
      shiftHistory.call(terminal, 1); //back in time, maxxing out at length of child nodes.
    } else if(aKeystroke == 'ArrowDown'){
      shiftHistory.call(terminal, -1); //forward in time, maxxing out at 0
    }
    terminal.scrollTop = terminal.scrollHeight;
}

// for some commands it is necessary to know if the keystroke was local or remote. isLocal carries this info.
function handleInput(terminalContainer,options){
    aTerminal = terminalContainer.parentElement;
    aTerminal.setAttribute('history', 0);

    var query = terminalContainer.lastChild.querySelector('.input').textContent;
    //Trim whitespace, split on space, check if that first result is in the list of keywords. If it is, return (or call) the property of that name. Else, run the whole phrase as a query
    var result;
		var potentialCommand = query.trim().split(' ')[0]; //even for empty strings or strings with no spaces, the result of trim().split() will be an array with at least one element. 
		if(customCommands[potentialCommand]){
      let potentialArguments = query.trim().split(' ').slice(1); // returns an empty array if no args, otherwise, arguments are passed as an array
      //This is kind of a mess. When I added a general exec command for whitelisted serverside CLI tools (git, mkdir, ffmpeg, touch), I decided I needed to know which command was run,
      //But so far all my other commands are set to expect arguments as an array. Since I need to know the requested command inside the general exec function inside customCommands.js,
      //I roll up the options passed to handleInput (right now, just if a command was executed locally or remotely) with an object contained potentialCommand, destructured es6 style.
    	
      result = customCommands[potentialCommand](aTerminal,potentialArguments,Object.assign({potentialCommand},options)); //calls the function, should return an Element
		} else {
      result = evaluate(aTerminal, query); 
		}

    aTerminal.querySelector('.terminalContainer').appendChild(result);
    result.className += " result";

    initPrompt(terminalContainer);
    
}

function initPrompt(terminalContainer){
    let protoPrompt = terminalContainer.parentElement.getAttribute('protoPrompt');
    let tempDiv = document.createElement('div')
    tempDiv.innerHTML = 
    `<div class="promptContainer"><span class="prompt">${protoPrompt}<span class="arrow"></span></span><div class="input"></div></div>`
    /* looks like this before deleting whitespace to avoid unwanted text nodes
    <div class="terminalContainer">
      <div class="promptContainer">
        <span class="prompt"> localhost/root0
          <span class="arrow"></span>
        </span>
        <div class="input"></div>
      </div>
    </div>
    */
    terminalContainer.appendChild(tempDiv.firstElementChild);
    resetPromptStyle(terminalContainer)
    terminalContainer.scrollTop = terminalContainer.scrollHeight;
}

function resetPromptStyle(terminalContainer){
    setTimeout(()=>{
      let promptHeight = terminalContainer.querySelector('.prompt').getBoundingClientRect().height;
      //returns style.css as a stylesheet object
      let styleSheet = Array.from(document.styleSheets).filter(each => each.href && each.href.includes('styles/style.css'))[0]
      let arrowRule = Array.from(styleSheet.rules).filter(each => each.selectorText.includes('arrow'))[0].style;
      arrowRule.height = promptHeight / Math.sqrt(2);
      arrowRule.width = promptHeight / Math.sqrt(2);
    },0)
}

function evaluate(aTerminal, aQuery){
		var result = createResult();
		result.className = 'result';
    try {
      var localEval = function(){return eval(aQuery)}; 
      result.innerHTML = localEval.call(aTerminal);
			return result;
    } catch(e) {
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
    handleKeystroke(event.key, event.keyCode, terminal.id, {isLocal: true});
  }
});

window.addEventListener('load', () =>  resetPromptStyle(document.querySelector('.terminalContainer')));

//Use to have the dblclick add terminal listener in here, moved it to utils.js. Will be refactored to create whatever is the default. 
// document.documentElement.addEventListener('dblclick', event => {
//   if(event.target.tagName === 'HTML' || event.target.tagName === 'BODY'){//only addTerminal if body or higher (document where there is no body) is clicked. Top of the path is Window -> Document -
//     socketize(event);
//     addTerminal(event.clientX, event.clientY);
//   }
// });

// function addTerminal(posX, posY){
//   var aTerminal = new Terminal(posX, posY);
//   document.body.appendChild(aTerminal.element);
//   aTerminal.element.focus();
// }
