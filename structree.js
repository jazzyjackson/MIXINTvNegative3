// Should simply be the loop which renders content to screen, the DOM applied to elements in each object

function addLeaf(event){
      textree.push({
        sizeXY: [100,300],
        positionXY: [event.clientX,event.clientY],
        contents: "",
        id: "Leaf" + Math.floor(Date.now())
      })
      updateDOM()
      updateStyle()
   
    }



  function updateDOM(){
      for(var i = 0; i < textree.length; i++){
        if(textree[i].id > latestDOMID){ //so basically, if this leaf hasn't been drawn yet, draw it!
          console.log(textree[i].id) 
          latestDOMID = textree[i].id
          document.body.appendChild(document.createElement("div"))
          document.getElementsByTagName("div")[i].id = textree[i].id
          
          var thisLeaf = document.getElementById(textree[i].id)
          thisLeaf.className = "freshLeaf"
          thisLeaf.appendChild(document.createElement("span"))
          thisLeaf.firstChild.className = "inlet"
          thisLeaf.appendChild(document.createElement("span"))
          thisLeaf.lastChild.className = "outlet"


        }
      } 
    }

    function updateStyle(){
      for(var i = 0; i < textree.length; i++){
        if(textree[i].id > latestStyleID){
          styleSheet.insertRule("#" + textree[i].id + " { top: " + textree[i].positionXY[1] + "; left: " + textree[i].positionXY[0] + ";}",0)
          console.log("#" + textree[i].id + " { top:" + textree[i].positionXY[1] + "; left: " + textree[i].positionXY[0] + ";}")
          latestStyleID = textree[i].id
        }
      }
    }
