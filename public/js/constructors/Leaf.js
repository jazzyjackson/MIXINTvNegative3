function Leaf(xPos, yPos, width, height){
  xPos || (xPos = 50);
  yPos || (yPos = 50);
  width || (width = 400);
  height || (height = 300);

  let nodeId = `leaf${nextIdNum('.leaf')}`
  let tempNode = document.createElement('div');
  tempNode.innerHTML = `
  <div showMenu="false" broadcast="true" listen="true" style="left: ${xPos}px; top: ${yPos}px; width: ${width}px; height: ${height}px; position: absolute;background: white" tabindex="1" class="leaf" id="${nodeId}">

  <h3 class="entityHeader">${nodeId}
    <div class="menuButton"></div>
    <div class="removeButton"></div>
    <div class="menu">
      <ul>
        <li tabindex="2"> Edit <div class="editButton"></div></li>
        <li tabindex="2"> Broadcast <div class="broadcastButton"></div> </li>
        <li tabindex="2"> Listen <div class="listenButton"></div> </li>
        <li tabindex="2"> Save <div class="saveButton"></div> </li>
      </ul>
    </div>
  </h3> 

  </div>
  `
  this.element = tempNode.firstElementChild;
  this.entityHeader = this.element.querySelector('.entityHeader')

  // this.element.style.left = xPos + 'px';
  // this.element.style.top = yPos + 'px';  
  // this.element.style.width = width + 'px';
  // this.element.style.height = height + 'px';
  // this.element.tabIndex = 1;
  // this.element.style.position = 'absolute';
  // this.element.className = 'leaf';

  // this.element.style.background = 'white';

  // this.entityHeader = document.createElement('h3');
  // this.element.id = "leaf" + nextIdNum('.leaf');
  // this.entityHeader.innerText = this.element.id;
  // this.entityHeader.className = 'entityHeader';  

  // let newDiv = document.createElement.bind(document, 'div');

	// let menu = newDiv();
  //   let removeButton = newDiv();
  //   let menuButton = newDiv();
	// menuButton.className = 'menuButton';
	// removeButton.className = 'removeButton';
	// menu.className = 'menu'; 
  //   menu.innerHTML = `
  //     <ul>
  //       <li tabindex="2"> Edit <div class="editButton"></div></li>
  //       <li tabindex="2"> Broadcast <div class="broadcastButton"></div> </li>
  //       <li tabindex="2"> Listen <div class="listenButton"></div> </li>
  //       <li tabindex="2"> Save <div class="saveButton"></div> </li>
  //     </ul>
	// `
	// this.entityHeader.appendChild(menu);
	// this.entityHeader.appendChild(removeButton);
	// this.entityHeader.appendChild(menuButton);


    // this.element.appendChild(this.entityHeader);
    // this.element.setAttribute('listen', 'true')
    // this.element.setAttribute('broadcast', 'true')
    initLeafListeners(this.element);

};

Leaf.prototype.render = function(){
  return this.element
}

