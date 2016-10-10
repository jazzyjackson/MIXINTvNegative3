var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var identities = {};
server.listen(3000);


app.use(express.static(__dirname+ '/public'));
//app.get('/', function(req,res){
//    res.sendfile('./public/index.html');
//    
//})

io.on('connection', function(socket){
		identities[socket.id] = {ip: socket.client.conn.remoteAddress.split(':').slice(-1)[0], name: null};
    socket.on('event', function (data){
        socket.broadcast.emit('event',data);
    });

		socket.on('identityRequest', function(req){
			//I think each client's identity request will come in separately, when one user asks whoami and hits enter, the local browser will evaluate that and emit an identity request, so this message shouldn't be broadcast.
			//req is the incoming message. socket is the particular connection.	
			console.log(identities[socket.id]);
			socket.emit('identityResponse', {
				placeHolderId: req.placeHolderId,
				socketid: socket.id,
				ipaddress: identities[socket.id].ip,
				name: identities[socket.id].name
			});
		})


		socket.on('timeRequest', function(req){
			socket.emit('timeResponse', {
				placeHolderId: req.placeHolderId,
				serverTime: Date()
			})
		})

    //events to implement: identityRequest, timeRequest
})

// socket.client.conn.remoteAddress reports the Public IP of the origin of the message
// socket.id reports the socket ID of the origin of the message. 
