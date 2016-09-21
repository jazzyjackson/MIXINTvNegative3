function addNewLeafTo(event){
    if(event.target.classList.contains('fertile') || event.target.tagName == 'BODY'){ //fertile = can have children.
        var newLeaf = document.createElement('div');
        newLeaf.classList.add('fertile');
        newLeaf.id = "Leaf" + Math.floor(Date.now());
        //newLeaf.appendChild(document.createElement('span'));
        event.target.appendChild(newLeaf);

        newLeaf.style.top = 0;//event.target. style.top.slice(0,-2) + 100;
        newLeaf.style.left = 300;
        newLeaf.tabIndex = 1;
    }

    event.stopPropagation();
}

function updateStyle(event){
   if(activeElement !== null && editMode === false){
        if(activeElement.tagName == 'BODY' || activeElement.tagName == 'HTML'){
            activeElement = document.body;
            activeElement.style = "margin-left: " + (Number(activeElement.style.marginLeft.slice(0,-2)) + event.movementX) + "; margin-top: " + (Number(activeElement.style.marginTop.slice(0,-2)) + event.movementY) + ";"
            console.log(activeElement.style.marginLeft);
        } else {
            activeElement.style = "left: " + (Number(activeElement.style.left.slice(0,-2)) + event.movementX) + "; top: " + (Number(activeElement.style.top.slice(0,-2)) + event.movementY) + ";"
            console.log(activeElement.style.left);
        }
     //  console.log("left: " + (Number(activeElement.style.left.slice(0,-2)) + event.movementX) + "; top: " + (Number(activeElement.style.top.slice(0,-2)) + event.movementY) + ";")
   }
     //    console.log(event)

}



function swapTextforSpan(event){
    if(event.target.tagName == 'DIV'){
        event.stopPropagation();
    }

    var targetParent = (event == MouseEvent) ? findDIVinBubble(event) : event.target;
    var textElement = targetParent.firstChild;

    //activeElement = targetParent;

    if(textElement.tagName == "TEXTAREA"){
        var newTextElement = document.createElement('span');
        newTextElement.textContent = textElement.value;
        targetParent.replaceChild(newTextElement, textElement);

        editMode = false;
    }

    if(textElement.tagName == "SPAN"){
        var newTextElement = document.createElement('textarea');
        newTextElement.value = textElement.textContent;
        targetParent.replaceChild(newTextElement, textElement);
        newTextElement.focus();
        newTextElement.addEventListener('blur',function(){swapTextforSpan(event);});

        editMode = true;
    }

}


function findDIVinBubble(event){ //follows the event bubble up the path, 0 index is event.targe, length-1 index is topmost parent element. bubble until a DIV is hit, return the div.
    var thisNode = event.target;
    while(thisNode.tagName != 'DIV' && thisNode.tagName != 'HTML') {
        thisNode = thisNode.parentNode;
    }
    return thisNode;


}
