var customCommands = {
	whoami: whoami, 
	whatami: whatami,
	whereami: whereami, 
	howami: howami, 
	whenami: whenami,
	rename: rename,
	save: save,
	list: ls,
	files: ls,
	create: create,
	open: open,
	git: exec,
	mkdir: exec,
	ls: exec,
	touch: exec,
	pwd: exec,
	cd: exec,
	cat: exec
	

};


function exec(aTerminal, ArrArray,options){

		let requestElement = createResult('request', 'Running command on server...');
		let command = options.potentialCommand + ' ' + ArrArray.join(' ');
		//throw out anything after the semicolon, only allow one command be passed
		command = command.split(';')[0];
		fetch(`http://${window.location.host}/exec`, {
			method: 'POST',
			body: 'command=' + encodeURIComponent(command),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
		.then(res => res.json())
		.then(resObj => {
			console.log(resObj)
			requestElement.className = 'result'
			requestElement.innerText = resObj.stdout ? resObj.stdout : ( resObj.stderr ? resObj.stderr : resObj.err)
			if(resObj.stderr || resObj.err){
				requestElement.style.color = 'red';
			}
			if(requestElement.innerText === ""){
				requestElement.innerText = 'The command ran without error or output'
			}
			aTerminal.scrollTop = aTerminal.scrollHeight;
		})
		return requestElement;
}

function open(aTerminal, ArrArray){
	var requestElement = createResult('request', 'Looking for files...');
	requestElement.id = Date.now();
	let pathname = ArrArray[0];
	fetch('http://' + window.location.host + '/readFile' + '?pathname='+encodeURIComponent(pathname))
	.then(res => res.json())
	.then(resObj => {
		console.log(resObj);
		create(aTerminal, ['Codemirror',resObj,pathname])
		requestElement.className = 'result';
		requestElement.innerText = 'Maybe it worked';
		aTerminal.scrollTop = aTerminal.scrollHeight;

	})

	return requestElement;

}

function ls(aTerminal, ArrArray){
	var requestElement = createResult('request', 'Looking for files...');
	requestElement.id = Date.now();
	
	fetch('http://' + window.location.host + '/fs', {
		method: 'POST',
		body: 'pathname=' + ArrArray[0],
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
	.then(res => res.json())
	.then(resObj => {
		let dirString = buildDirDisplay(resObj);
		requestElement.innerHTML = 'dirString Placeholder'; //setting the innerHTML of an empty element is sketch, apparently!
		requestElement.innerHTML = dirString;

		addDblClickListeners(requestElement);
		requestElement.className = 'result directoryContainer';
		aTerminal.scrollTop = aTerminal.scrollHeight;
	})

	return requestElement;
}

//OPEN will call create, passing the terminal, + ['CodeMirror','String of file'] as arg.
//wow how on earth did this work. create takes a terminal that its called from and an array of options? Maybe that should be an options object
function create(aTerminal, ArrArray){
	//So first up, figure out the name of the things we're creating. Here its assumed to be the first element of the ArrAray
	let newEntity = ArrArray[0];
	//create Placeholder object
	let result = createResult('query', 'Waiting for constructor to be available');
	//checks if the consturctor function is in the global scope. Constructor functions bear the same name as their source file, so 'newEntity' represents a filename and a function name.
	if(window[newEntity] === undefined){
		//if the constructor function of that name doesn't exist, create a script tag and set its src as this pathname and then append that script to the head
		let newScript = document.createElement('script');
		let pathname = '/js/constructors/' + newEntity + '.js';
		newScript.setAttribute('src', pathname);
		newScript.setAttribute('defer','true')
		document.head.appendChild(newScript);

		//loading the script is asynchronous, the constructor cannot be called immediately
		//timerID is a reference to the timer that is attempting to invoke the constructor every 10 milliseconds
		//once it succeeds in invoking the constructor, it clearsInterval of itself, so it stops trying

		let timerID = setInterval(() => {
			if(window[newEntity]){
				let newConstructor = new window[newEntity](...ArrArray.slice(1));
				let newComponent = newConstructor.render();
				document.body.appendChild(newComponent);
				clearInterval(timerID);
				result.innerText = `Constructor retrieved and invoked, ${newComponent.id} added to DOM`
			}
		}, 10)
		//after one second, the timerID is cleared whether it exists or not.
		//if the constructor still isnt available, the result inner Text is updated and a mean girls reference is printed to the console.
		//furthermore, the script tag that was generated to load the constructor src is removed from the DOM if it never worked out.

		setTimeout(()=>{
			if(!window[newEntity]){
				console.log(`Stop trying to make ${newEntity} happen, it's not going to happen`)
				result.innerText = `I couldn't find a constructor for ${newEntity}`
				document.head.removeChild(newScript);
			}
			clearInterval(timerID);
		},1000)

	} else {
		//OK, the construcotr DOES exist on the global scope, so invoke it with the new keyword and pass 2nd and 3rd elements of the array to it as args
		let newConstructor = new window[newEntity](...ArrArray.slice(1)) 
		try{
			let newComponent = newConstructor.render()
			document.body.appendChild(newComponent)
			result.innerText = `Constructor invoked, ${newComponent.id} added to DOM`
		}catch(e){
			result.innerText = `${newEntity} was not undefined, but it also didn't return a DOM node from a render function, so I don't know what's up.`
		}
	}


	return result;

}

function buildDirDisplay(resObj){
	let fileObj = resObj.result;
	let pathname = resObj.pathname;
	let resultString = '';
	for(each in fileObj){
		resultString += `<p class="fs ${fileObj[each]}" title="${pathname + each}"> ${each} </p> `
	}
	return resultString;
}


function rename(aTerminal, ArrArray){
	var newId;
	var targetElement = aTerminal;
	switch(ArrArray.length){
		case 1: newId = ArrArray[0]; break;
		case 2: newId = ArrArray[1]; targetElement = document.getElementById(ArrArray[0]); break;
		default: return createResult('error result', 'rename takes one or two arguments.');
	}
	try {
		var oldId = targetElement.id;
	} catch(e) {
		console.error(`${ArrArray[0]} doesn't appear to an element. Use an existing id.`)
		console.error(e);
		return createResult('result', `${ArrArray[0]} doesn't appear to an element. Use an existing id.`);
	}
	targetElement.id = newId;
	targetElement.firstChild.firstChild.textContent = targetElement.id;
	targetElement.setAttribute('prompt', 'localhost/' + targetElement.id + " > ");
	return createResult('result', oldId + ' has been renamed to ' + targetElement.id);
}

function save(aTerminal, ArrArray, options){
	if(ArrArray.length > 0){
		return createResult ('error result', 'save does not take arguments');
	}
	/* SOOOOO HACCCKYYYYY */
	saveCodeMirrorContent();
	let deadTree = document.documentElement.innerHTML; //a dead tree is a string
	let liveTree = document.createElement('html');
	liveTree.innerHTML = deadTree; //but the string is brought back into a DOM. Zombie tree, really.
	collapseCodeMirrors(liveTree); //traverse the zombie tree, modifying before saving.
	
	var requestElement = createResult('request','Attempting to send file, waiting on response');
	requestElement.setAttribute('createdAt', Date.now())
	//builds a unique id from the terminals id and the number of nodes (which should only get bigger). 
	requestElement.id = String(aTerminal.id) + aTerminal.childNodes.length;

  //OK so at this time, 'save' was just invoked as a command. The request element has not yet been handed back to the command reducer so its not on the real DOM yet.
	//So in order to get the result of this operation saved to disk, we gotta:
	//take the zombie tree before its saved, 
	//grab the terminal the terminal in the zombie tree with the same id as the live tree from which it was invokved
	//append the requestElement (via ref passed to function, it doesnt exist on the zombie tree yet)
	appendSaveTime(liveTree,aTerminal.id,requestElement)

  //save is called with an options object. When invoked with keystroke, isLocal is true, when invoked via socket message, isLocal is false or undefined.
	if(options.isLocal){
		fetch('http://' + window.location.host + '/savethis', {
			method: 'POST',
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: ('content=' + encodeURIComponent(liveTree.innerHTML) +
			      '&fileName=' + aTerminal.id + '.html')
		})
		.then(res => res.text())
		.then(result => {
			//requestelement has an attribute recounting its creation time in ms. Subtract current time by this time to find out how longs its been since this function started.
			let starttime = requestElement.getAttribute('createdAt')
			let roundTripTime = Date.now() - starttime;
			//append that time to the string placed inside the resulting div (overwriting previous message 'attempting to save') and swap out className for result. Allows for conditional styling.
			requestElement.innerText = `${result} in ${roundTripTime}ms`;
			requestElement.className = 'result';
			//appendResult is a socket creator. Fires a message named filesaveresult, payload is the innerText plus the id of the request element...
			appendResult(requestElement.innerText, requestElement.id, aTerminal.id);
			window.history.pushState({},null,`http://${window.location.host}/savedTrees/${aTerminal.id}.html${location.search}`)
			fireSubscribe();
			//sets documnent.head text tag inner text to current terminal id. 
			updateTitleText(aTerminal.id);
		})
	}
	//if the save command was triggered via socket message, just return the request div, with the matching id.
	return requestElement;

}

function collapseCodeMirrors(liveTree){
	let mirrors = Array.from(liveTree.getElementsByClassName('codemirrorContainer'));
	mirrors.forEach(aMirrorContainer => {
		let cm = aMirrorContainer.getElementsByClassName('CodeMirror')[0];
		cm.remove();
	})
}

function appendSaveTime(liveTree,updateTerminalId,elementToClone){
	//BOGUS! getElementById only works when you have a document, and an html element is NOT a document
	// let terminalToAppendTo = liveTree.getElementById(updateTerminalId)
	// I'll use querySelector instead
	let terminalToAppendTo = liveTree.querySelector(`#${updateTerminalId}`)
	let fileToSaveSize = formatBytes(liveTree.innerHTML.length,-1);
	//it screwed things up to try modifing the element that was being attached to the actualy dom. bad move in an async world. clone it instead.
	let elementToAppend = elementToClone.cloneNode();
	elementToAppend.innerText = `${fileToSaveSize} written successfully to ${updateTerminalId}.html at ${new Date()}`;
	terminalToAppendTo.appendChild(elementToAppend);
	initPrompt(terminalToAppendTo)
}

function updateTitleText(newName){
		let possibleCurrentTitle = document.getElementsByTagName('TITLE')[0];
		if(!possibleCurrentTitle){
			possibleCurrentTitle = document.head.appendChild(document.createElement('title'));
		}
		possibleCurrentTitle.innerText = newName;
}

function saveCodeMirrorContent(){
		let mirrors = Array.from(document.getElementsByClassName('codemirrorContainer'));
		mirrors.forEach(aMirrorContainer => {
			let cm = aMirrorContainer.cm;
			cm.save();
			let textArea = aMirrorContainer.getElementsByTagName('TEXTAREA')[0];
			textArea.innerHTML = textArea.value;
		})
}


function createResult(className, innerText){
  var placeHolder = document.createElement('div');
	placeHolder.className = className ? className : 'result'; //default className
	placeHolder.id = Date.now();
	placeHolder.innerHTML = innerText ? innerText : ' '; // default innerText
  return placeHolder;
}

function whoami(aLeaf){
//build a response placeholder, progress bar dealio
//create an id for that placeholder. Probably a span. 
//emit the request and pass the id of the placeholder
//return the placeholder. Later, when the response is
//received, the id will be returned as a part of the 
//payload so that the information can be stuffed back
//into the placeholder correspondant with that id.
	var placeHolder = createResult('query');
	socket.emit('identityRequest', {placeHolderId: placeHolder.id});	
	return placeHolder;
}

socket.on('identityResponse', function(socket){
	var roundTripTime = Date.now() - socket.placeHolderId; 
	var requestElement = document.getElementById(socket.placeHolderId);
  requestElement.className = 'result';
	requestElement.innerHTML = (socket.ipaddress === '1') ? 'localhost' : socket.ipaddress;	
});

function whatami(aLeaf){
	return createResult('result', aLeaf.id + ' is a ' + aLeaf.toString() + ' with classes "' + aLeaf.className + '"');
	//grab class name. id. just attributes of the terminal. 
}

function whereami(aLeaf){
	return createResult('result', aLeaf.id + " is " + aLeaf.style.left + " from the left and " + aLeaf.style.top + " from the top of its parent element, " + aLeaf.parentElement.tagName + ".");
	//just grab x y coordinates. Maybe find oneself in the dom. Which child?
}

function howami(aLeaf){
 // maybe each consturctor has a mthod, such that, the DIV from which the question is asked could simply call its own method, perhaps printing its identifying information. The constructor function, the file, the person who created it. Bare minimum, the div contains an attribute, a reference to its constructor, which exists in the global scope, so it can be printed by name. As for filename...
}

function whenami(){
	var placeHolder = createResult('query');
	socket.emit('timeRequest', {placeHolderId: placeHolder.id});	
	return placeHolder;
}

socket.on('timeResponse', function(socket){
	var roundTripTime = Date.now() - socket.placeHolderId; //currenttime in ms was used for id.
	var requestElement = document.getElementById(socket.placeHolderId);
  	requestElement.className = 'result';
	requestElement.innerHTML = 'Server time is: ' + socket.serverTime;	
	var localtimeResult = requestElement.cloneNode();
	var roundtripResult = requestElement.cloneNode();
	localtimeResult.innerHTML = 'Local time is:' + Date();
	roundtripResult.innerHTML = 'Round trip time to ' + window.location.host + ' was ' + roundTripTime + 'ms.';
	requestElement.parentNode.insertBefore(localtimeResult, requestElement);
	requestElement.parentNode.insertBefore(roundtripResult, localtimeResult);
	requestElement.parentNode.scrollTop = requestElement.parentNode.scrollHeight;
});

function runFile(event){
	//targetTerminal determines what the container element of a file is, for purposes of appending the result and socketizing the target to sync others
	//event.path returns an array of elements the event bubbled up through, from the event.target to the window. Filter it down to one element. 
	// This will work as long as you don't have a terminal within a terminal 
	let targetTerminal = event.path.filter(el => el.className && el.className.includes('terminal'))[0];
	//the title attribute of the event target is the pathname of the file displayed.
	let targetPath = event.target.title;
	//this is for generating the equivelant command that could be typed. Maybe I should just generate that text as if it were typed and execute???
	let prompt = targetTerminal.getAttribute('protoPrompt');
  //Huh. open FILE is like create Codemirror FILETEXT. prints ls when re-executing list...
	if(event.target.className && event.target.className.includes('directory')){
		targetTerminal.lastChild.innerText = `${prompt} ls ${targetPath}`
	} else if(event.target.className && event.target.className.includes('text')){
		targetTerminal.lastChild.innerText = `${prompt} open ${targetPath}`
	} 

	//Oh yeah, it does these things whether you single clicked or double clicked, but then checks for double click before executing.
	if(event.type === 'dblclick'){
		if(event.target.className && event.target.className.includes('directory')){
			//socketizing with custom command (which I belive is just bounced), and the socket object includes the id of the terminal, the name of a function, and a pathname.
			socket.emit('remoteRunFile', { terminal: targetTerminal.id, func: 'ls', path: targetPath});
			//Similar action, just different if you're opening or listing. runs ls - oh, from here ls is just a shortcut for the function name, not a property of the customCommands object.'
			let listResult = ls(targetTerminal, [targetPath]);
			targetTerminal.appendChild(listResult);
			initPrompt(targetTerminal);
		} else if(event.target.className && event.target.className.includes('text')){
			socket.emit('remoteRunFile', { terminal: targetTerminal.id, func: 'open', path: targetPath});

			let fileOpenResult = open(targetTerminal, [targetPath]);
			targetTerminal.appendChild(fileOpenResult);
			initPrompt(targetTerminal);
		}
	}


}



function addDblClickListeners(directoryElement){
	let listOfFiles = Array.from(directoryElement.getElementsByClassName('fs'));
	listOfFiles.forEach(el => el.addEventListener('dblclick', runFile));
	listOfFiles.forEach(el => el.addEventListener('click', runFile));
}
