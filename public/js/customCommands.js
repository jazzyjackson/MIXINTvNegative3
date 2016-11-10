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
	cd: exec
	

};


function exec(aTerminal, ArrArray,options){

		let requestElement = createResult('request', 'Running command on server...');
		let command = options.potentialCommand + ' ' + ArrArray.join(' ');
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
			if(!resObj.stdout){
				requestElement.style.color = 'red';
			}
			if(requestElement.innerText === ""){
				requestElement.innerText = 'The command ran without error or output'
			}
			aTerminal.scrollTop = aTerminal.scrollHeight;
		})
		console.log(command)
		return requestElement;
}

function open(aTerminal, ArrArray){
	var requestElement = createResult('request', 'Looking for files...');
	requestElement.id = Date.now();
	let pathname = ArrArray[0];
	fetch('http://' + window.location.host + '/readFile' + '?pathname='+encodeURIComponent(pathname))
	.then(res => {
		console.log(res)
		return res.json();
	})
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
function create(aTerminal, ArrArray){
	let newEntity = ArrArray[0];
	let result = createResult('query', 'Waiting for constructor to be available');
	console.log(arguments);
	if(window[newEntity] === undefined){
		let pathname = '/js/constructors/' + newEntity + '.js';
		let newScript = document.createElement('script');
		newScript.setAttribute('src', pathname);
		newScript.setAttribute('defer','true')
		document.head.appendChild(newScript);

		//loading the script is asynchronous, the constructor cannot be called immediately

		let timerID = setInterval(() => {
			if(window[newEntity]){
				let newConstructor = new window[newEntity](ArrArray[1],ArrArray[2])
				let newComponent = newConstructor.render();
				document.body.appendChild(newComponent);
				clearInterval(timerID);
				result.innerText = `Constructor retrieved and invoked, ${newComponent.id} added to DOM`
			}
		}, 10)


		setTimeout(()=>{
			if(!window[newEntity]){
				console.log(`Stop trying to make ${newEntity} happen, it's not going to happen`)
				result.innerText = `I couldn't find a constructor for ${newEntity}`
				document.head.removeChild(newScript);
			}
			clearInterval(timerID);
		},1000)

	} else {
	//	let newConstructor = eval(`new ${newEntity}`)
		let newConstructor = new window[newEntity](ArrArray[1],ArrArray[2])
		try{
			let newComponent = newConstructor.render() //an array of things after the name of the thing
			document.body.appendChild(newComponent)
			result.innerText = `Constructor invoked, ${newComponent.id} added to DOM`
		}catch(e){
			result.innerText = `Couldn't find constructor for ${newEntity}`
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
	targetElement.childNodes[0].innerText = targetElement.id;
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
	requestElement.id = String(aTerminal.id) + aTerminal.childNodes.length;

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
			let starttime = requestElement.getAttribute('createdAt')
			let roundTripTime = Date.now() - starttime;
			requestElement.innerText = result + ' in ' + roundTripTime + 'ms';
			requestElement.className = 'result';
			appendResult(requestElement.innerText, requestElement.id);
			console.log(requestElement.innerText)
			window.history.pushState({},null, 'http://' + window.location.host + '/savedTrees/' + aTerminal.id + '.html' )
			updateTitleText(aTerminal.id);
		})
	}
	return requestElement;

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

function collapseCodeMirrors(liveTree){
	let mirrors = Array.from(liveTree.getElementsByClassName('codemirrorContainer'));
	mirrors.forEach(aMirrorContainer => {
		let cm = aMirrorContainer.getElementsByClassName('CodeMirror')[0];
		cm.remove();
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
