function attachMouseEvents() {
   console.log("mouseEvents says hello");
   addEventListener('dblclick', function(){

      if(event.target.tagName == 'BODY') addNewLeafTo(event);
      else {
         var bubbledDIV = findDIVinBubble(event);
         activeElement = document.createElement('p');
         bubbledDIV.appendChild(activeElement);
         editMode = true;
      }
         /*    if(editMode == false && (event.target.tagName == 'DIV' || event.target.tagName == 'SPAN')){
            activeElement = findDIVinBubble(event);
            swapTextforSpan(event);
            console.log("doubleClicked on " + event.target + "and activated: " + activeElement);
        } */
        //console.log(event);
    });
   addEventListener('mouseup', function(){if(!editMode) activeElement = null;});
   addEventListener('mousedown', function(){
      if(!editMode){
         activeElement = findDIVinBubble(event);
      } else {
         activeElement = null;
         editMode = false;
      }
   });

   addEventListener('mousemove', function(){updateStyle(event);});
   addEventListener('onblur',function(){console.log("blur");});

   addEventListener('touchstart', function(){console.log(event)});
   addEventListener('touchmove', function(){console.log(event)});
   addEventListener('touchend', function(){console.log(event)});
}
