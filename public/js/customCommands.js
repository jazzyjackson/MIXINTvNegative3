var customCommands = {
	whoami: whoami, 
	whatami: whatami,
	whereami: whereami, 
	howami: howami, 
	whenami: whenami,
	rename: rename,
	save: save,
	ls: ls,
	list: ls,
	files: ls,
	create: create
};

function create(aTerminal, ArrArray){
	let newEntity = ArrArray[0];
	let result = createResult('query', 'Waiting for constructor to be available');

	if(window[newEntity] === undefined){
		let pathname = '/js/constructors/' + newEntity + '.js';
		let newScript = document.createElement('script');
		newScript.setAttribute('src', pathname);
		document.head.appendChild(newScript);

		//loading the script is asynchronous, the constructor cannot be called immediately

		let timerID = setInterval(() => {
			if(window[newEntity]){
				let newConstructor = eval(`new ${newEntity}`);
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
		let newConstructor = eval(`new ${newEntity}`)
		let newComponent = newConstructor.render()
		document.body.appendChild(newComponent)
		result.innerText = `Constructor invoked, ${newComponent.id} added to DOM`
	}


	return result;

}

function buildDirDisplay(resObj){
	let fileObj = resObj.result;
	let pathname = resObj.pathname;
	let resultString = '';
	for(each in fileObj){
		console.log(each);
		console.log(fileObj[each])
		// switch(fileObj[each]){
		// 	case 'directory': resultString += `<p class='fs directory' title="${pathname + each}"> 🗁  ${each}  </p>`; break;
		// 	case 'text': resultString += `<p class='fs text'> 🗎  ${each}  </p>`; break;
		// 	case 'image': resultString += `<p class='fs image'> 🖻  ${each}  </p>`; break;
		// }
		resultString += `<p class="fs ${fileObj[each]}" title="${pathname + each}"> ${each} </p> `
		//This could probably refactored to not have to deal with switchcase, but I think I like the verbosity
	}
	console.log(resultString);
	return resultString;
}

function ls(aTerminal, ArrArray){
	var requestElement = createResult('request', 'Looking for files...');
	requestElement.id = Date.now();
	
	fetch('http://' + window.location.host + '/fs', {
		method: 'POST',
		body: 'pathname=' + ArrArray[0],
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	})
	.then(res => res.json())
	.then(resObj => {
		console.log(resObj);
		let dirString = buildDirDisplay(resObj);
		requestElement.innerHTML = dirString;
		requestElement.className = 'result';
		aTerminal.scrollTop = aTerminal.scrollHeight;
	})

	return requestElement;
}

function rename(aTerminal, ArrArray){
	var newId;
	var targetElement = aTerminal;
	switch(ArrArray.length){
		case 1: newId = ArrArray[0]; break;
		case 2: newId = ArrArray[1]; targetElement = document.getElementById(ArrArray[0]); break;
		default: return createResult('error result', 'rename takes one or two arguments.');
	}
	console.log(newId);
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

function save(aTerminal, ArrArray, isLocal){
	console.log(arguments)
	if(ArrArray.length > 0){
		return createResult ('error result', 'save does not take arguments');
	}
	/* SOOOOO HACCCKYYYYY */
	saveCodeMirrorContent();
	let deadTree = document.documentElement.innerHTML;
	let liveTree = document.createElement('html');
	liveTree.innerHTML = deadTree;
	collapseCodeMirrors(liveTree);
	
	var requestElement = createResult('request','Attempting to send file, waiting on response');
	requestElement.setAttribute('createdAt', Date.now())
	requestElement.id = String(aTerminal.id) + aTerminal.childNodes.length;

  if(isLocal){
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

		})
	}
	return requestElement;

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
  var placeHolder = document.createElement('p');
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

