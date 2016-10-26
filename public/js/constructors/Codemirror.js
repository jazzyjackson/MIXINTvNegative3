function Codemirror(xPos,yPos,optStringInit){
  let cssInclude = document.createElement('link')
  cssInclude.setAttribute('rel', 'stylesheet');
  cssInclude.setAttribute('href', '/lib/codemirror.css')
  document.head.appendChild(cssInclude);
  let jsInlucde = document.createElement('script')
  jsInlucde.setAttribute('src', '/lib/codemirror.js')
  document.head.appendChild(jsInlucde);
  let jsModeInlucde = document.createElement('script')
  jsModeInlucde.setAttribute('src', '/lib/mode/javascript/javascript.js')
  document.head.appendChild(jsModeInlucde);

  Leaf.call(this, xPos, yPos)
  this.element.className += ' codemirrorContainer'
  var codemirrorList = document.getElementsByClassName('codemirror')
  this.element.id = 'untitled' + codemirrorList.length;
  var header = this.element.getElementsByClassName('entityHeader')[0];
  header.innerText = this.element.id;
  this.element.style.width = '400px';
  this.element.style.height = '400px';
  var codeText = document.createElement('textarea');
  this.element.appendChild(codeText);

  setTimeout(()=>{
    this.element.cm = CodeMirror.fromTextArea(codeText, {
      mode: "javascript",
      lineNumbers: true
    });
  },100)

  this.render = function(){
    return this.element;
  }
}