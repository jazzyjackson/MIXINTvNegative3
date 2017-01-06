//Simple Component Tutorial! Constructor name should be same as filename
//can take arguments if you think you'll use them
//In this case my arguments will be Image(url[,xPos,yPos]) - Leaf, sets default width and height if they're null
function Tag(tagName,options = {}){
  //calls the Leaf consturctor, which attaches all your click and drag events and adds a header
  //as well as initial styling. xpos,ypos,width,height. properties are now available on 'this'
  Leaf.call(this,options.xPos,options.yPos)
  this.element.className += ' tag'; //add image to list of classNames with +=
  //starts out having an id of 'leaf'' + numberOfLeaves but you should overwrite this. this.entityHeader is a reference to the DOM Node instantiated in the parent Constructor
  this.element.id = "tag" + nextIdNum('.tag')
  this.element.querySelector('.headerTitle').textContent = this.element.id;

	let htmlContainer = document.createElement('div');
	htmlContainer.id = 'inner' + this.element.id;
	htmlContainer.style = 'width: 100%; height: 100%;';
	htmlContainer.setAttribute('target', options.pathname)
  htmlContainer.attachShadow({mode: 'open'});
  
  if(options.innerHTML){
    htmlContainer.shadowRoot.innerHTML = options.innerHTML;
    //after assigning the innerHTML of the shadowRoot, if there are any script tags, re-attach each one with replaceChild, which will invoke the scripts, which doesn't happen when just setting the innerHTML of a node.'
    mountScripts(htmlContainer.shadowRoot)
    htmlContainer.textContent = options.innerHTML;
  } else {
    let defaultElement = document.createElement(tagName ? tagName : 'div');
    htmlContainer.shadowRoot.appendChild(defaultElement);
  }
  if(options && options.url) defaultElement.setAttribute('src',url);
  
  //for images I don't want to set a fixed height, the image will fill width
  //and the containing div will stretch to fit around it. I'll set a minHeight tho.
  this.element.style.minHeight = '100px';
  this.element.style.height = '';
  this.element.appendChild(htmlContainer);
}


Tag.prototype.render = function(){
  return this.element;
}

window.addEventListener('load', () => {
  let tags = Array.from(document.getElementsByClassName('tag'))
  tags.forEach(tagElement => {
    let innerTag = tagElement.childNodes[1];
    innerTag.shadowRoot || innerTag.attachShadow({mode: 'open'})
    setTimeout(()=>{
      innerTag.shadowRoot.innerHTML = innerTag.textContent;
      mountScripts(innerTag.shadowRoot)
    }, 0)
  })
})
