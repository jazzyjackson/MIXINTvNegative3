var server = require('http').createServer(handler)
var fs = require('fs')
var url = require('url')


server.listen(8080)

function handler(request, response) {
    fs.readFile(__dirname + url.parse(request.url).pathname,
        function (err, data) {
            console.log(url.parse(request.url).pathname)
            if (err) {
                response.writeHead(500)
                return response.end('Error loading index.html')
            }

        response.writeHead(200)
        response.end(data)
        })
}