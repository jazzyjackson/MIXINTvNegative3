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
theEditButton.addEventListener('click', addSection);

theEditZone.appendChild(theEditButton);

let editStyles = document.createElement('style');
editStyles.innerText = '#theEditButton {display: none;} #theEditZone:hover > #theEditButton {display: block;}';

document.head.appendChild(editStyles);
theBody.insertBefore(theEditZone, document.body.firstElementChild);


function addSection(){
	let editable = document.createElement('div');
	editable.style.height = '100px'
	editable.style.width = '100%'
	editable.setAttribute('contentEditable', 'true');
	editable.style.background = 'white';
	console.log('inserting')
	theBody.insertBefore(editable, theEditZone);
}
