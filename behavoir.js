//all of the event listeners and function dispatch goes here
//as well as functions that determine the interactivity of the page
// DEPENDENT ON structure.js, for updateDOM and updateStyle

    window.addEventListener('dblclick', function(){dblclickDispatch(event);});
    window.addEventListener('mousedown', function(){mousedownDispatch(event);});
    window.addEventListener('mouseup', function(){
            window.removeEventListener('mousemove', dragLeaf)
    })
  
    function dblclickDispatch(event){
      if(event.target.tagName == "BODY") addLeaf(event)
      else console.log(event.target.id)
    }

    function mousedownDispatch(event){
      if(event.target.tagName != "BODY"){
        activeElement = event.target.id
        console.log(event.target.id)
        
        window.addEventListener('mousemove', dragLeaf)
      }

    }

    function dragLeaf(event){
        console.log(event.clientX + ":" + event.clientY)
        document.getElementById(activeElement).style.left = event.clientX;
        document.getElementById(activeElement).style.top = event.clientY;
    }

    /*  
    One MouseDown: determine what the context is, text body? left edge / right edge / corner, etc? background? Graph port?
    on mouse move, update the values on the determined context
    on MouseUp, release the info
    */

    function addLeaf(event){
      textree.push({
        sizeXY: [100,300],
        positionXY: [event.clientX,event.clientY],
        contents: "",
        id: Math.floor(Date.now())
      })
      updateDOM()
      updateStyle()
   
    }


