var server = require('http').createServer(handler)
var fs = require('fs')

server.listen(80)

function handler(request, response) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                response.writeHead(500)
                return response.end('Error loading index.html')
            }

        response.writeHead(200)
        response.end(data)
        })
}