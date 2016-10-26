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
  this.element.className += ' codemirror'
  var codemirrorList = document.getElementsByClassName('codemirror')
  this.element.id = 'CodeMirror' + codemirrorList.length;
  var header = this.element.getElementsByClassName('entityHeader')[0];
  header.innerText = this.element.id;
  this.element.style.width = '400px';
  this.element.style.height = '400px';

  setTimeout(()=>{
    var codeMirror = CodeMirror(this.element, {
      mode: "javascript",
      lineNumbers: true
    });
    console.log(codeMirror)
  },100)

  this.render = function(){
    return this.element;
  }
}