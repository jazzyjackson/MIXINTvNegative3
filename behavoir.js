//all of the event listeners and function dispatch goes here
//as well as functions that determine the interactivity of the page
// DEPENDENT ON structure.js, for updateDOM and updateStyle

    window.addEventListener('dblclick', function(){dblclickDispatch(event);});
    window.addEventListener('mousedown', function(){mousedownDispatch(event);});
    window.addEventListener('mouseup', function(){
            window.removeEventListener('mousemove', dragLeaf)
            updateProperty(textree, activeElement, "sizeXY", [event.clientX, event.clientY]) 
    })

    function updateProperty(whichtree, whichleaf, propertyName, newValue){
     // console.log(whichtree.filter(grabLeafById)) 
      function grabLeafById(obj) { if(obj.id == whichleaf) return obj } // why do I get obj is not defined when this comes before filter?
 
    }
  
    function dblclickDispatch(event){
      if(event.target.tagName == "BODY") addLeaf(event) //addLeaf exists in structree.js
      else console.log(event.target.id)
    }

    function mousedownDispatch(event){
      if(event.target.className == "freshLeaf"){
        activeElement = event.target.id
        console.log(event.target.id)
        window.addEventListener('mousemove', dragLeaf)
      }
      if(event.target.className == "inlet" || event.target.className == "outlet") console.log(event.target.parentNode.id)

    }

    function createLine(targetNode){ // append an svg element, with an M point at the center of the inlet/outlet, it's endpoint to be calculated on MouseMove

    }

    function dragLeaf(event){
       // console.log(activeElement)
        document.getElementById(activeElement).style.left = event.clientX;
        document.getElementById(activeElement).style.top = event.clientY;
    }

    /*  
    One MouseDown: determine what the context is, text body? left edge / right edge / corner, etc? background? Graph port?
    on mouse move, update the values on the determined context
    on MouseUp, release the info
    */

