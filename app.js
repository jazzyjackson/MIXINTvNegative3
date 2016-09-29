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
    console.log('connection');
    socket.on('event', function (data){
        socket.broadcast.emit('event',data);
        console.log(data);
    })
})

