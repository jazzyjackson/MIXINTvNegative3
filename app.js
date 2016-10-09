var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);


app.use(express.static(__dirname+ '/public'));
//app.get('/', function(req,res){
//    res.sendfile('./public/index.html');
//    
//})

io.on('connection', function(socket){
    socket.on('event', function (data){
        socket.broadcast.emit('event',data);
    })
    //events to implement: identityRequest, timeRequest
})
// socket.client.conn.remoteAddress reports the Public IP of the origin of the message
// socket.id reports the socket ID of the origin of the message. 
