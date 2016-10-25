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

function buildDirDisplay(fileObj){
	var resultString = '';
	for(each in fileObj){
		console.log(each);
		console.log(fileObj[each])
			switch(fileObj[each]){
				case 'directory': resultString += '🗁 ' + each + '\n'; break;
				case 'text': resultString += '🗎 ' + each + '\n'; break;
				case 'image': resultString += '🖻 ' + each + '\n'; break;
			}
	}
	console.log(resultString);
	return resultString;
}
function ls(aTerminal, ArrArray){
	var requestElement = createResult('request', 'Looking for files...');
	requestElement.id = Date.now();
	
	persist = new XMLHttpRequest();
	persist.addEventListener('load', function(){
		 var result = buildDirDisplay(JSON.parse(persist.responseText));
		//use the response from the server as the innerText of the element attached to the terminal
		requestElement.innerText = result;
		//change the class of the element from request to result
		requestElement.className = 'result';
		aTerminal.scrollTop = aTerminal.scrollHeight;

	})
	persist.open("POST", 'http://' + window.location.host + '/fs');
  persist.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	persist.send('pathname=' + ArrArray[0]);

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
		return createResult ('error result', 'save takes on argument, a divs ID');
	}
	
	var requestElement = createResult('request','Attempting to send file, waiting on response');
	requestElement.setAttribute('createdAt', Date.now())
	requestElement.id = String(aTerminal.id) + aTerminal.childNodes.length;
  if(isLocal){
		persist = new XMLHttpRequest();
		persist.addEventListener('load', function(){
			console.log(persist.responseText);
			var starttime = requestElement.getAttribute('createdAt')
			var roundTripTime = Date.now() - starttime;
			requestElement.innerText = persist.responseText + ' in ' + roundTripTime + 'ms';
			requestElement.className = 'result';
			if(window.history.pushState){
				window.history.pushState({},null,'/savedTrees/' + aTerminal.id + '.html');
			}
			appendResult(requestElement.innerText, requestElement.id);
		})
		persist.open("POST", 'http://' + window.location.host + '/savethis');
			persist.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		persist.send(
			'content=' + encodeURIComponent(document.documentElement.innerHTML) +
			'&fileName=' + aTerminal.id + '.html'
		);
	}

	return requestElement;



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

