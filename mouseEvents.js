function attachMouseEvents() {
   console.log("mouseEvents says hello");
   addEventListener('dblclick', function(){
        if(event.target.tagName == 'BODY') addNewLeafTo(event);
        if(editMode == false && (event.target.tagName == 'DIV' || event.target.tagName == 'SPAN')){
            activeElement = findDIVinBubble(event);
            swapTextforSpan(event);
            console.log("doubleClicked on " + event.target + "and activated: " + activeElement);
        }
        //console.log(event);
    });
   addEventListener('mouseup', function(){activeElement = null;});
   addEventListener('mousedown', function(){if(!editMode) activeElement = event.target;});
   addEventListener('mousemove', function(){updateStyle(event);});
   addEventListener('onblur',function(){console.log("blur");});
}