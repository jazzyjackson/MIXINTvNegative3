function attachKeyEvents() {
    window.addEventListener('keydown', function(){
        if(editMode === true){
            if(event.key == 'Backspace'){
                activeElement.innerHTML = activeElement.innerHTML.slice(0, -1)
            } else if((event.keyCode > 46 && event.keyCode < 91)||(event.keyCode > 93 && event.keyCode < 112)||(event.code == "Space")) {
                activeElement.innerHTML += event.key;
            }
        console.log(event);
        }
        if(event.target.tagName == 'DIV' && editMode === false){
            if(event.key == 'c'){addNewLeafTo(event);}
            if(event.key == 'ArrowUp' || event.key == 'k'){
                if(event.target.previousSibling !== null) event.target.previousSibling.focus();
                else(event.target.parentNode.lastChild.focus());
            }
            if(event.key == 'ArrowDown' || event.key == 'j'){
                if(event.target.nextSibling !== null) event.target.nextSibling.focus();
                else(event.target.parentNode.childNodes[0].focus());
            }
            if(event.key == 'ArrowLeft' || event.key == 'h'){
                if(event.target.parentNode.tagName !== 'BODY') event.target.parentNode.focus();
            }
            if(event.key == 'ArrowRight' || event.key == 'l'){
                if(event.target.childNodes[0] !== undefined) event.target.childNodes[0].focus();
            }
            if(event.key == 'Enter'){
                activeElement = event.target;
          //      console.log(activeElement);
                swapTextforSpan(event);
            }
           
        }
        if(event.key == 'Escape'){
            console.log(event);
            editMode = false;
            activeElement = null;
        }
        });
    console.log("keyEvents says hello");

}

