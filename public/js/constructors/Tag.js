//Simple Component Tutorial! Constructor name should be same as filename
//can take arguments if you think you'll use them
//In this case my arguments will be Image(url[,xPos,yPos]) - Leaf, sets default width and height if they're null
function Tag(tagName,options = {}){
  console.log(arguments)
  //calls the Leaf consturctor, which attaches all your click and drag events and adds a header
  //as well as initial styling. xpos,ypos,width,height. properties are now available on 'this'
  Leaf.call(this,options.xPos,options.yPos)
  console.log(this)
  this.element.className += ' tag'; //add image to list of classNames with +=
  //starts out having an id of 'leaf'' + numberOfLeaves but you should overwrite this. this.entityHeader is a reference to the DOM Node instantiated in the parent Constructor
  this.element.id = "tag" + nextIdNum('.tag')
  this.entityHeader.firstChild.textContent = this.element.id;

	let htmlContainer = document.createElement('div');
	htmlContainer.id = 'inner' + this.element.id;
	htmlContainer.style = 'width: 100%; height: 100%;';
	htmlContainer.setAttribute('target', options.pathname)
  if(options.innerHTML){
    htmlContainer.innerHTML = options.innerHTML;
  } else {
    let defaultElement = document.createElement(tagName ? tagName : 'div');
    htmlContainer.appendChild(defaultElement);
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
    innerTag.shadowRoot.innerHTML = innerTag.textContent
  })
})
