var express = require('express');
var app = express();
var server = require('http').Server(app);

var fs = require('fs')

var io = require('socket.io')(server);
var serverlogging = require('morgan');
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 




var identities = {};
server.listen(3000);

app.use(serverlogging('dev'));
app.use(express.static(__dirname+ '/public'));
app.use(express.static(__dirname + '/public/savedTrees'));
//app.get('/', function(req,res){
//    res.sendfile('./public/index.html');
//    
//})

app.post('/', function(req,res,next){
	var htmlString = req.body.content;
	var fileName = req.body.fileName;
	console.log(htmlString, fileName)
	fs.writeFile(__dirname + '/public/savedTrees/' + fileName, htmlString, function(err){
		if(err){
			res.status(400).send(err);
		} else {
			res.status(200).send(fileName + ' written successfully');
		}
	})
})


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
