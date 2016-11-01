//Simple Component Tutorial! Constructor name should be same as filename
//can take arguments if you think you'll use them
//In this case my arguments will be Image(url[,xPos,yPos]) - Leaf, sets default width and height if they're null
function Picture(url,xPos,yPos){
  //calls the Leaf consturctor, which attaches all your click and drag events and adds a header
  //as well as initial styling. xpos,ypos,width,height. properties are now available on 'this'
  Leaf.call(this,xPos,yPos)
  console.log(this)
  this.element.className += ' image'; //add image to list of classNames with +=
  //starts out having an id of 'leaf'' + numberOfLeaves but you should overwrite this. this.entityHeader is a reference to the DOM Node instantiated in the parent Constructor
  this.element.id = "image" + document.getElementsByClassName('image').length;
  this.entityHeader.innerText = this.element.id;

  this.element.title = url; //title text, appears on mouseover, refers to url to expose that info to user
  let imageElement = document.createElement('img');
  imageElement.setAttribute('src',url);

  imageElement.style.width = '100%';
  //for images I don't want to set a fixed height, the image will fill width
  //and the containing div will stretch to fit around it. I'll set a minHeight tho.
  this.element.style.height = '';
  this.element.style.minHeight = '100px';
  this.element.appendChild(imageElement);
}


Picture.prototype.render = function(){
  return this.element;
}