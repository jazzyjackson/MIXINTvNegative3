//The idea here is to add a div as the 1st child of the body
//It will have an initial size just to be a hover zone
//It will have a button thats hidden unless its parent is hovered
//When the button is clicked, it will append a div class='static' above it
//such that multiple of these statics can be stacked
//Later this could be extended, to take a page from Medium, to allow a user
//to choose what type of default element they want (header, image, etc)
//Actually it'd be pretty cool if it was a drop zone and automatically embedded the new file into the HTML

let theBody = document.body;
let firstLeaf = document.querySelector('.leaf')
let theEditZone = document.createElement('div');
theEditZone.id = 'theEditZone'
theEditZone.style = 'height: 100px; width: 100%;';

let theEditButton = document.createElement('button');
theEditButton.id = 'theEditButton';
theEditButton.innerText = 'Add Section';
theEditButton.style = 'margin: 20px';
theEditButton.addEventListener('click', event => addSection(event, null));

theEditZone.appendChild(theEditButton);

let editStyles = document.createElement('style');
editStyles.innerText = '#theEditButton {display: none;} #theEditZone:hover > #theEditButton {display: block;}';

document.head.appendChild(editStyles);
theBody.insertBefore(theEditZone, document.body.firstElementChild);


function addSection(event, remoteUniq){
	//called from one of two places. Either, on a addSection button click
	//or in response to a socket event, fireClick
	//if it was fired remotely, it is called without arguments.
	//if it was called via click listener, the mouseevent will be in the arguments object, and arguments.length will by 1, truthy.
	aNiq = remoteUniq ? remoteUniq : Math.trunc(Math.random() * Math.pow(2,32));
	if(event) fireClick(this.id,aNiq);
	console.log(arguments)
	console.log(this);
	let editable = document.createElement('div');
	editable.style.height = '100px'
	editable.style.width = '100%'
	//editable.setAttribute('contentEditable', 'true');
	editable.style.background = 'white';
	editable.className = 'codemirrorContainer tempEditor'
	editable.id = 'tempeditable' + aNiq;
	console.log('inserting')
	theBody.insertBefore(editable, theEditZone);

	let aTempEditor = CodeMirror(editable);

  aTempEditor.on('change',broadcastEdits);
  aTempEditor.on('cursorActivity',broadcastPos) //Will pass the cm object  
	editable.cm = aTempEditor;
	console.log(aTempEditor)
}


document.body.addEventListener('keydown', event => {
	if(event.key === 'Escape'){
		let mirrorEscapedFrom = event.path.filter(el => el.className && el.className.includes('tempEditor'))[0]
		if(mirrorEscapedFrom){
			revertTempEditor(mirrorEscapedFrom);
		}
	}
})


function revertTempEditor(aMirrorContainer){
	console.log(aMirrorContainer);
	aMirrorContainer.innerHTML = aMirrorContainer.cm.doc.getValue();
	console.log(fireRevert);
	fireRevert(aMirrorContainer.id);
}

