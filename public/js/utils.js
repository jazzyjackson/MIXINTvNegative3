/* It's necessary to place mouse move and mouse touch events on the document 
 * otherwise if the element doesn't keep the pace and falls out from under the cursor,
 * the events would stop fires.
 * This way, 
 * movements continue to update until mouse/finger is lifted 

 * utils.js depends on socketevents.js depends on socket.io.js

*/
var updatePos;
var allContent = document.documentElement;

allContent.addEventListener('mousedown', function(event){
  //Neat! On mousedown, the activeElement is the LAST thing that was clicked on, not the thing that mousedown just hit.
  if((event.target.tagName === 'HTML' || event.target.tagName === 'BODY') && event.shiftKey){
    //console.log(event.clientX, event.clientY, document.activeElement.id)
    document.activeElement = document.body;
    document.documentElement.addEventListener('mousemove', handleMove);
    socketize(event);
    updatePos = createUpdatePos(event.clientX, event.clientY, document.activeElement.id);
  }
})

allContent.addEventListener('dblclick', event => {
  if(event.target.tagName ==='HTML' || event.target.tagName === 'BODY'){//only addTerminal if body or higher (document where there is no body) is clicked. Top of the path is Window -> Document -
		// I learned a thing that doesn't work! clientX is readOnly. Something similar worked when converting touch events to mouse events because the touch events dont HAVE a clientX property, so I can create one and assign it however I want. But I can't reassign the mouse events x & y.
		// console.log(event.clientX, event.clientY);
		// event.clientY = event.clientY - parseInt(document.body.style.top); 	
		// console.log(event.clientX, event.clientY);
		//This is, perhaps, inelegant.
		//when the click event is received by other clients, they're going to create an element
		//based off the clientX and clientY of the socketized event. Since I cannot overwrite 
	  //I create a copycat object with the necessary properties to be socketized as if it were a mouse event
		let relativeEvent = {
				type: event.type, //Will only ever be dblclick since we're inside a dblclick listener
				clientX: event.clientX - parseInt(document.body.style.left), //Takes the relative body offset of the client, calculates the position of the new elements for the local and the remote connections.
				clientY: event.clientY - parseInt(document.body.style.top) 	
		}
    socketize(relativeEvent);
    addTerminal(relativeEvent.clientX, relativeEvent.clientY);
  }
});

function addTerminal(posX, posY){
  var aTerminal = new Terminal(posX, posY);
  document.body.appendChild(aTerminal.element);
  aTerminal.element.focus();
}


allContent.addEventListener('mouseup', event => {
  socketize(event);
  if(updatePos) updatePos = undefined;
  document.documentElement.removeEventListener('mousemove', handleMove);
});

allContent.addEventListener('touchcancel', event => updatePos = undefined);
allContent.addEventListener('touchend',  event => updatePos = undefined);

function convertTouchToMouse(event){
  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  return event;
}

function handleMove(event){
  if(event.buttons && updatePos){
    event.preventDefault();
		socketize(event, document.activeElement.id);
		updatePos(event.clientX, event.clientY, document.activeElement.id);
	}
};


function createUpdatePos(clientX, clientY){
	//this is a function creator. When a mouse/touchdown event occurs, the initial position 
	//is enclosed in a function, those variables are updated on mousemove and will persist
	//as long as the function exists. On touch/mouseup events, the function is destroyed (the variable it was assigned to is reassigned null)
  var theLastX = clientX;
  var theLastY = clientY;
  var enclosedUpdatePos = function(clientX, clientY, elementId){
      element = document.getElementById(elementId);
      var movementX = clientX - theLastX;
      var movementY = clientY - theLastY;
      theLastX = clientX;
      theLastY = clientY;

      var currentXpos = parseInt(element.style.left); //slicing off the last 2 characters gets rid of 'px', allowing casting to number
      var currentYpos = parseInt(element.style.top);
      element.style.left = (currentXpos + Math.floor(movementX)) + 'px'; //touch events have way too many significant digits,
      element.style.top = (currentYpos + Math.floor(movementY)) + 'px'; // flooring the number for consistency with mouse events, which report integers
  }
  return enclosedUpdatePos;
};

function initLeafListeners(aLeafElement){
  let thisHeader = aLeafElement.querySelector('.entityHeader');
  aLeafElement.setAttribute('showmenu','false')
  //this overwrites whatever header is already there, but its fine, because it happens before I attach all the event listeners
  thisHeader.outerHTML = window.entityHeader;
  thisHeader = aLeafElement.querySelector('.entityHeader');
  thisTitle = thisHeader.querySelector('.headerTitle')
  thisTitle.textContent = aLeafElement.id;
  

  thisHeader.addEventListener('mousedown', function(event){
    document.documentElement.addEventListener('mousemove', handleMove);
    socketize(event);
    updatePos = createUpdatePos(event.clientX, event.clientY, document.activeElement.id);
  })

  aLeafElement.addEventListener('touchstart', function(event){
      var convertedEvent = convertTouchToMouse(event);
      socketize(event);
      updatePos = createUpdatePos(convertedEvent.clientX, convertedEvent.clientY, document.activeElement.id);
      aLeafElement.focus();
  });

  aLeafElement.addEventListener('touchmove', function(event){
    event.preventDefault();
    if(updatePos){
      var convertedEvent = convertTouchToMouse(event);
      updatePos(convertedEvent.clientX, convertedEvent.clientY, document.activeElement.id);
      socketize(event, document.activeElement.id);
    }
  });
  
  aLeafElement.addEventListener('scroll', function(event){
    event.target.firstChild.style.top = event.target.scrollTop - 10;
  })

  let editButton = aLeafElement.querySelector('.editButton')
  if(editButton){
    editButton.onmousedown = editThis;
    editButton.parentElement.onmousedown = editThis;    
  }
  let removeButton = aLeafElement.querySelector('.removeButton')
  if(removeButton){
    removeButton.onmousedown = event => {
      let parentNode = event.target.parentElement.parentElement;
      parentNode.remove()
      if(event.isTrusted){
        let queryId = `#${getParentNode(event.target).id}  .${event.target.className}`;
        socketize(event, queryId);
      }
    }
  }
  let broadcastButton = aLeafElement.querySelector('.broadcastButton')
  if(broadcastButton){
    broadcastButton.parentElement.onmousedown = () => toggleAttr('broadcast');
  }
  let listenButton = aLeafElement.querySelector('.listenButton')
  if(listenButton){  
    listenButton.parentElement.onmousedown = () => toggleAttr('listen');
  }

  let saveButton = aLeafElement.querySelector('.saveButton')
  if(saveButton){
    saveButton.parentElement.onmousedown = event => {
      let parentLeaf = event.target.parentElement.parentElement.parentElement.parentElement;
      let filename = parentLeaf.getAttribute('target');
      let fileText = parentLeaf.cm.doc.getValue();
      fetch(`http://${location.host}/saveText`, {
        method: 'POST',
        body: 'text=' 
              + encodeURIComponent(fileText) 
              + '&filename=' 
              + encodeURIComponent(filename),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    }
  }

  let menuButton = aLeafElement.querySelector('.menuButton');
  let quitMenu = () => {
    document.removeEventListener('mousedown',quitMenu);
    setTimeout(()=>{
      aLeafElement.setAttribute('showMenu', 'false');
    }, 200)
  };
  menuButton.addEventListener('click', event => {
    aLeafElement.setAttribute('showMenu', 'true')
    setTimeout(()=>{
      document.addEventListener('mousedown', quitMenu);
    },100)
  });
  let menuContainer = aLeafElement.querySelector('.menu');
  //to contain clicks in the menu from being socketed
  menuContainer.addEventListener('mousedown', event => event.stopPropagation())
  menuContainer.addEventListener('mousemove', event => event.stopPropagation())
  menuContainer.addEventListener('mouseup', event => event.stopPropagation())
  menuContainer.addEventListener('click', event => event.stopPropagation())
  menuContainer.addEventListener('dblclick', event => event.stopPropagation())
  menuContainer.addEventListener('touchdown', event => event.stopPropagation())
  menuContainer.addEventListener('touchmove', event => event.stopPropagation())
  menuContainer.addEventListener('touchend', event => event.stopPropagation())
}

function toggleAttr(attrName, optLeaf){
  let theLeaf = optLeaf || event.target;
  while(!theLeaf.className.includes('leaf') && theLeaf){
    theLeaf = theLeaf.parentElement;
  }
  let attrStatus = theLeaf.getAttribute(attrName)
  theLeaf.setAttribute(attrName, attrStatus === 'true' ? 'false' : 'true')
}


window.addEventListener('load', ()=>{
  var styles = Array.from(document.styleSheets, each => each.href.includes('menustyle'));
  if(!styles.some(each=>each)){
    let menuStyle = document.createElement('link')
    menuStyle.setAttribute('href','/styles/menustyle.css')
    menuStyle.setAttribute('rel','stylesheet')
    document.head.appendChild(menuStyle)
  }
  //reattach all the click and drag listeners to all elements
  var listOfLeaves = Array.from(document.getElementsByClassName('leaf'));
  listOfLeaves.forEach(leaf => {
    initLeafListeners(leaf)
    leaf.scrollTop = leaf.scrollHeight;
    // console.log(leaf);
  });
  //reattach eventlisteners to any directory folders inside the terminals
  var listOfDirContainers = Array.from(document.getElementsByClassName('directoryContainer'));
  listOfDirContainers.forEach(aDirectoryContainer => {
    addDblClickListeners(aDirectoryContainer)
  })
	
	//If a query string exists in the URL, their key value pairs will be dropped into an object here.
	//values are in arrays to cover the possibility of multiple values on a given key. Super Nifty work by Jan Wolter
	let initOptions = new QueryString().dict;	
	let bodyStyle = document.body.style;
  bodyStyle.height = initOptions.height ? initOptions.height : innerHeight;
  bodyStyle.width = initOptions.width ? initOptions.width : innerWidth;
	bodyStyle.top = initOptions.topOffset ? initOptions.topOffset : 0;
	bodyStyle.left = initOptions.leftOffset ? initOptions.leftOffset : 0;

  //if there are codemirrors, re-instantiate them with fromTextArea
  //if codemirrors weren't used, then codemirror.js won't be on the DOM and CodeMirror will be undefiend
})

document.documentElement.addEventListener('keydown',(event)=>{
  if(event.ctrlKey && event.key == 's'){
    event.preventDefault();
    try {
    saveShortcut();
    } catch (e){
      console.log(e);
    }
  }
})

function saveShortcut() { 
  //Ugh. Ugly workaround if you hit ctrl s when a codemirror is focused. Before saving, 
  //grab elements with classname CodeMirror-focused and remove it from classes
  let possiblyFocusedCM = document.querySelector('.CodeMirror-focused');
  possiblyFocusedCM && (possiblyFocusedCM.className = possiblyFocusedCM.className.replace(/CodeMirror-focused/,''));
  let termArr = Array.from(document.getElementsByClassName('terminal')); 
  termArr = termArr.filter(each => window.location.pathname.includes(each.id)); 
  terminalMatchesPath = termArr[0]; 
  save(terminalMatchesPath, [], { isLocal: true }) 
}

function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0 Byte';
   var k = 1000; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function shiftxPx(event){
  //shift pixels will be called when an arrow key and shift are pressed, so I'm expecting a key event and will switch based on key'
  let bodyStyle = document.body.style
  switch(event.code){
    case "ArrowUp": bodyStyle.top = parseInt(bodyStyle.top) + parseInt(bodyStyle.height) + 'px'; break;
    case "ArrowRight": bodyStyle.left = parseInt(bodyStyle.left) - parseInt(bodyStyle.width) + 'px'; break;
    case "ArrowDown": bodyStyle.top = parseInt(bodyStyle.top) - parseInt(bodyStyle.height) + 'px'; break;
    case "ArrowLeft":  bodyStyle.left = parseInt(bodyStyle.left) + parseInt(bodyStyle.width) + 'px'; break;
    case "Digit0": bodyStyle.left = 0; bodyStyle.top = 0; break;
  }
}

allContent.addEventListener('keydown', event => {
		//This does step on some toes. Codemirror uses ctrl shift arrow to highlight word by word. So this could be changed to ensure activeElement is body, something like that
    if(["ArrowUp","ArrowRight","ArrowDown","ArrowLeft","Digit0"].includes(event.code) && event.altKey){
      event.stopPropagation();
      shiftxPx(event)
    }
})


function liveConnect(instanceOfCodeMirror, aNodeToConnect){
  let shadowToConnect = aNodeToConnect.shadowRoot ? aNodeToConnect.shadowRoot : aNodeToConnect.attachShadow({mode: 'open'});
	
  let pushMirror2HTML = function(){
    let newHTML = instanceOfCodeMirror.doc.getValue();
    if(instanceOfCodeMirror.doc.getValue() !== shadowToConnect.innerHTML){
      aNodeToConnect.textContent = newHTML;
      shadowToConnect.innerHTML = newHTML;
      mountScripts(shadowToConnect);
    }
  };

  let pushHTML2Mirror = function(info){
    console.log(info)    
    let newHTML = aNodeToConnect.shadowRoot.innerHTML;
    if(instanceOfCodeMirror.doc.getValue() !== shadowToConnect.innerHTML){
      instanceOfCodeMirror.doc.setValue(shadowToConnect.innerHTML);
    }
  }
  let tagChangeWatcher = new MutationObserver(pushHTML2Mirror);
  tagChangeWatcher.observe(shadowToConnect,{subtree: true, characterData: true});
	instanceOfCodeMirror.on('change',pushMirror2HTML);

  //setting the update attribute isn't necessary for the connect to happen - it is used on page load to reconnect.
  instanceOfCodeMirror.display.wrapper.parentElement.setAttribute('update',aNodeToConnect.id);
}	

//takes a node, returns a node.
// getParentNode node, string => node
function getParentNode(thisElement, optClassName = 'leaf'){

  //traverse up the tree until you find a leaf, or maybe no leaf is found, exit in that case too. return whatever was found.
  while(thisElement && !thisElement.className.includes(optClassName)){
    thisElement = thisElement.parentElement;
  }
  return thisElement;
}

function editThis(event){
        event.stopPropagation();  
        //This is attached to the edit button on all leaves
        //functionality is overloaded
        //if there is an innerdiv (assienged to targetNode) then: create Codemirror, fire liveConnect between that Codemirror and that innerdiv
        //if that innerdiv doesn't exist, we're not dealing with a tag, so right now I'm assuming its a JS string that can be inserted to a script tag
        //that has to be generalized. best to have an attribute that can be switched on.
        //the mouse click that fired this function will be on a button. two parents up exists the id of the div. inner + that id should give the element id of the inner DIV we want
        let parentNode = getParentNode(event.target)
        let parentId = parentNode.id;
				let targetNode = document.getElementById('inner' + parentId);
        if(targetNode){
          let mirrorText = targetNode.shadowRoot.innerHTML;
          let targetTerminal = document.querySelector('.terminal');
          let startX = parseInt(parentNode.style.left) + (parseInt(parentNode.style.width) / 2);
          let startY = parseInt(parentNode.style.top) + (parseInt(parentNode.style.height) / 2);
          let assumedCodemirrorId = 'Codemirror' + nextIdNum('.codemirrorContainer'); 
          let target = targetNode.getAttribute('target');
          target = (target === "undefined") ? targetNode.parentNode.id : target;
          create(targetTerminal, ['Codemirror', mirrorText, target, startX, startY])
          setTimeout(()=>{
            let hopefullyACodemirror = document.getElementById(assumedCodemirrorId);
            liveConnect(hopefullyACodemirror.cm,targetNode)
          }, 500)
        } else {
          hoist(parentNode.cm.doc.getValue())
        }
				//problem incoming: it should not be allowed to create a second codemirror for the same node. Or otherwise you better sync those docs.
        if(event.isTrusted){
          socketize(event, `#${parentId}  .editButton`)
        }
}

function nextIdNum(classname){
	//get a node list of all elements with this class
	nodelist = document.querySelectorAll(classname);
	//convert it to an array of id
	nodelist = Array.from(nodelist, each => each.id)
	//filter it to an array of ids with numbers
	nodelist = nodelist.filter(each => /[0-9]+/.test(each))
	//reduce it to just the number (exec returns an array of matches, I'll grab the first match
	nodelist = nodelist.map(each=>/[0-9]+/.exec(each)[0])
	//find the max
	let result = Math.max.apply(Math, nodelist)
	//Math.max on an empty array returns negative infinity. 
	return (result === -Infinity) ? 0 : result + 1;
}

function mountScripts(aNode){
    //querySelector is a method of any node. get element by tag name is a method that must be inherited from document. Maybe i'm mounting scripts that don't have a document.
    let scripts = Array.from(aNode.querySelectorAll('script'))
    scripts.forEach(scriptTag => {
      let newScript = document.createElement('script')
      newScript.textContent = scriptTag.textContent;
      scriptTag.parentNode.replaceChild(newScript, scriptTag);
    })
}
	
//Following code was too cool not to pull in. Offered copyleft by Jan Wolter at unixpapa.com/js/querystring.html
function QueryString(qs)
{
    this.dict= {};

    // If no query string  was passed in use the one from the current page
    if (!qs) qs= location.search;

    // Delete leading question mark, if there is one
    if (qs.charAt(0) == '?') qs= qs.substring(1);

    // Parse it
    var re= /([^=&]+)(=([^&]*))?/g;
    while (match= re.exec(qs))
    {
        var key= decodeURIComponent(match[1].replace(/\+/g,' '));
        var value= match[3] ? QueryString.decode(match[3]) : '';
        if (this.dict[key])
            this.dict[key].push(value);
        else
            this.dict[key]= [value];
    }
}

QueryString.decode= function(s)
{
    s= s.replace(/\+/g,' ');
    s= s.replace(/%([EF][0-9A-F])%([89AB][0-9A-F])%([89AB][0-9A-F])/gi,
        function(code,hex1,hex2,hex3)
        {
            var n1= parseInt(hex1,16)-0xE0;
            var n2= parseInt(hex2,16)-0x80;
            if (n1 == 0 && n2 < 32) return code;
            var n3= parseInt(hex3,16)-0x80;
            var n= (n1<<12) + (n2<<6) + n3;
            if (n > 0xFFFF) return code;
            return String.fromCharCode(n);
        });
    s= s.replace(/%([CD][0-9A-F])%([89AB][0-9A-F])/gi,
        function(code,hex1,hex2)
        {
            var n1= parseInt(hex1,16)-0xC0;
            if (n1 < 2) return code;
            var n2= parseInt(hex2,16)-0x80;
            return String.fromCharCode((n1<<6)+n2);
        });
    s= s.replace(/%([0-7][0-9A-F])/gi,
        function(code,hex)
        {
            return String.fromCharCode(parseInt(hex,16));
        });
    return s;
};

QueryString.prototype.value= function (key)
{
    var a= this.dict[key];
    return a ? a[a.length-1] : undefined;
};

QueryString.prototype.values= function (key)
{
    var a= this.dict[key];
    return a ? a : [];
};

QueryString.prototype.keys= function ()
{
    var a= [];
    for (var key in this.dict)
        a.push(key);
    return a;
};
