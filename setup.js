//establishes environment variables. The state of the document is stored here.

    var styleSheet = document.styleSheets[0]
    var branches// create an object with an entry for each id, and as the value of that property, a list of child nodes
    var roots// create an object with an entry for each id, and as a value of that property, a list of parent nodes
    var textree = []
    var latestDOMID = "" //May update this to search for id among map when dealing with nonlinear trees
    var latestStyleID = ""
    var activeElement = null