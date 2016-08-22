function attachKeyEvents() {
    window.addEventListener('keydown', function(){
        if(event.key == 'c'){addNewLeafTo(event);}
        if(event.target.tagName == 'DIV' && editMode === false){
            if(event.key == 'ArrowUp'){
                if(event.target.previousSibling.tagName == 'DIV') event.target.previousSibling.focus();
                else(event.target.parentNode.lastChild.focus());
            }
            if(event.key == 'ArrowDown'){
                if(event.target.nextSibling !== null) event.target.nextSibling.focus();
                else(event.target.parentNode.childNodes[1].focus());
            }
            if(event.key == 'ArrowLeft'){
                if(event.target.parentNode.tagName !== 'BODY') event.target.parentNode.focus();
            }
            if(event.key == 'ArrowRight'){
                if(event.target.childNodes[1] !== undefined) event.target.childNodes[1].focus();
            }
            if(event.key == 'Enter'){
                activeElement = event.target;
          //      console.log(activeElement);
                swapTextforSpan(event);
            }
           
        }
        if(event.key == 'Escape'){
            console.log(event);
            console.log(activeElement.focus());
            activeElement = null;
        }
        });
    console.log("keyEvents says hello");

}

