function Codemirror(optStringInit,optFileName,startX, startY){

  Leaf.call(this, startX, startY, 800, 400)
  this.element.className += ' codemirrorContainer'
  this.element.id = 'Codemirror' + nextIdNum('.codemirrorContainer');
  this.element.setAttribute('target',optFileName)
  let thisTitle = this.element.querySelector('.headerTitle');
  thisTitle.textContent = this.element.id;
  thisTitle.textContent += optFileName ? (' > ' + optFileName) : '';
 

  var editButton = this.element.querySelector('.editButton');
  editButton.parentElement.firstChild.textContent = 'Evaluate'

  var codeText = document.createElement('textarea');
  if(optStringInit){
    codeText.value = optStringInit;
  }
  this.element.appendChild(codeText);

  promiseToAppend('/codemirrorlib/codemirror.css')
  .then(() => promiseToAppend('/codemirrorlib/codemirror.js'))
  .then(()=> {
    this.element.cm = CodeMirror.fromTextArea(codeText, {
      lineNumbers: true,
      mode: null
    });
    this.element.cm.on('change',broadcastEdits)
  })
  .then(()=> optFileName && setHighlightMode(optFileName, this.element.cm))
  .catch(console.error.bind(console));

  this.render = () => this.element;
}

function setHighlightMode(optFileName, codemirror){
    promiseToAppend('/codemirrormode/meta.js')
    .then(() => CodeMirror.findModeByFileName(optFileName).mode)
    .then( mode => {
      console.log(`Setting codemirror mode to ${mode}`)
      if(mode === 'htmlmixed'){
         return promiseToAppend('/codemirrormode/javascript/javascript.js',
                       '/codemirrormode/css/css.js',
                       '/codemirrormode/xml/xml.js')
                .then(()=> promiseToAppend('/codemirrormode/htmlmixed/htmlmixed.js'))
      } else {
        return promiseToAppend(`/codemirrormode/${mode}/${mode}.js`)
      }
    })
    .then(() => {
      codemirror.setOption('mode', CodeMirror.findModeByFileName(optFileName).mode);
    })
}

function promiseToAppend(){
  //takes multiple arguments, pathnames of things to include. 
  //arguments are converted to an array.
  //A promise is returned representing whether those arguments were successfully attached
  let ArrayOfTags = Array.from(arguments)
  return new Promise((resolve,reject)=>{
    Promise.race([tryToAppend(ArrayOfTags),timeout(1000)])
    .then((appendSuccess)=>{
      if(appendSuccess){
        resolve('loaded successfully');
      } else {
        reject('failed to load');
      }
    })
  })
}

function tryToAppend(ArrayOfPaths){
  let promisesOfAppendment = ArrayOfPaths.map(aPathName => 
    new Promise( resolve => {
      let pathExtension = aPathName.split('.')
      pathExtension = pathExtension[pathExtension.length - 1];
      if(isAppended(aPathName)){
        console.log(`skipping ${aPathName}, already available`)
        resolve(true);
      } else if(pathExtension === 'js'){ //  && !isAppendended(aPathName)
        console.log(`${aPathName} not found, attaching to head`)
        let newTag = document.createElement('script')
        newTag.setAttribute('src', aPathName);
        newTag.setAttribute('defer','true');    
        newTag.addEventListener('load',()=>resolve(true))
        document.head.appendChild(newTag);
      } else if (pathExtension === 'css'){
        console.log(`${aPathName} not found, attaching to head`)        
        let newTag = document.createElement('link')
        newTag.setAttribute('rel', 'stylesheet');
        newTag.setAttribute('href', aPathName);
        newTag.addEventListener('load',()=>resolve(true))
        document.head.appendChild(newTag);        
      } else {
        throw new Error('tryToAppend should only be used to attach js and css')
      }
    })
  )
  return Promise.all(promisesOfAppendment)
}

function isAppended(aPathName){
    let pathExtension = aPathName.split('.')
    pathExtension = pathExtension[pathExtension.length - 1];
    let tagname = pathExtension === 'js' ? 'script' : 'link';
    let attribute = pathExtension === 'js' ? 'src' : 'href';
    let tags = Array.from(document.head.getElementsByTagName(tagname))
    return tags.some(tag => tag.getAttribute(attribute) && tag.getAttribute(attribute).includes(aPathName));
}

function timeout(ms){
  return new Promise((resolve)=>{
    setTimeout(()=>resolve(false),ms)
  })
}

function hoist(scriptString){
  let oldScript = document.getElementById('repl');
  oldScript.remove();
  let newScript = document.createElement('script');
  newScript.id = 'repl';
  newScript.textContent = scriptString;
  document.head.appendChild(newScript);
}




// Peripheral functions for codeMirror. Codemirror sync events.
/* There are two types of events to handle:
 * When any user clicks anywhere in the mirror, 
 * a message is socketized containing the line number.
 * The server can match the identity of the send, and broadcast 
 * the line number to be locked. 
 * 
 * On receiving the line number, the clients will use markText, readOnly
 * 
 * When an edit is made, the line number and the string are broadcast
 * clients will clear the marktext, insert the line, and re-mark the text. 
 */
function broadcastPos(theMirror){
  let lineOfCursor = theMirror.getDoc().getCursor().line;
  let mirrorContainer = theMirror.display.wrapper.parentElement.id;
  socket.emit('cursorActivity',{lineOfCursor, mirrorContainer});
  // mark = theMirror.markText({line:lineOfCursor,ch:0},{line:lineOfCursor+1,ch:0},{css: 'background: lightblue',readOnly: true})
  // console.log(lineOfCursor);
}

//this is fired on change
function broadcastEdits(theMirror,changeObj){
  //remote changes have an undefined origin. Only fire socket when change is local.
  if(changeObj.origin){
    let mirrorContainer = theMirror.display.wrapper.parentElement.id;
    let changeFrom = changeObj.from;
    let changeTo = changeObj.to;
    let newContent = changeObj.text;
    socket.emit('mirrorChange',{changeFrom, changeTo,newContent,mirrorContainer});
  }
}

//called from socketevents.js on('changemirror')
function changeMirror(data){
  let {changeFrom, changeTo, newContent, mirrorContainer} = data;
  let leaf = document.getElementById(mirrorContainer);
  let theMirror = leaf.cm
  theMirror.getDoc().replaceRange(newContent,changeFrom,changeTo)
}


window.addEventListener('load', ()=>{
    console.log('codemirror.js loaded')
    let mirrors = Array.from(document.getElementsByClassName('codemirrorContainer'))
    console.log(mirrors);
    mirrors.forEach(mirrorContainer => {
      let textArea = mirrorContainer.getElementsByTagName('TEXTAREA')[0];
      mirrorContainer.cm = CodeMirror.fromTextArea(textArea, {lineNumbers: true, mode: "htmlmixed"});
      mirrorContainer.cm.on('change',broadcastEdits);
      mirrorContainer.cm.on('cursorActivity',broadcastPos) //Will pass the cm object 
      let possibleUpdate = mirrorContainer.getAttribute('update');
      if(possibleUpdate){
        console.log('connecting to ' + possibleUpdate)
        liveConnect(mirrorContainer.cm,document.getElementById(possibleUpdate))
      } 
    })
})

