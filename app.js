const DEFAULT_APP = 'textreeplot.xyz'
const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');

const fs = require('fs')
const exec = require('child_process').exec

const io = require('socket.io')(server);
const serverlogging = require('morgan');
const bodyParser = require('body-parser')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


let port = process.env.PORT || 3000;
console.log(`Listening on ${port}`);
var identities = {};
server.listen(port);

app.use(serverlogging('dev'));
// if(){

// 	console.log('using...')
// }
//let textreeroute = require(`./routes/textreeplot.xyz`)
app.use('/', (req,res,next)=>{
	let host = req.headers.host;
	//two edge cases. 
	//localhost has :port on it, so, find the colon and replace it and everything after it with empty string, if it happens at the end (this is host, not pathname or href)
	host = host.replace(/:.*\b/,'');
	//same result should happen whether or not www. existed at the beggining (hence \b for word boundary)
	host = host.replace(/\bwww\./,'');
	if(host === 'localhost') host = DEFAULT_APP;
	//ya I know this is unusual
	require(`./routes/${host}`)(req,res,next);
})


function bounce(socket,name,payload){
	socket.broadcast.to(identities[socket.id].room).emit(name,payload);
}

io.on('connection', function(socket){

		identities[socket.id] = {ip: socket.client.conn.remoteAddress.split(':').slice(-1)[0], name: null};
    //event, filesaveResult, remoteRunFile, cursorActivity, mirrorChange are all just bounced back. Broadcast to all clients assigned to the same room.
		socket.on('event',           data => bounce(socket,'event', data))
		socket.on('filesaveResult',  data => bounce(socket,'filesaveResult',data))
		socket.on('remoteRunFile',   data => bounce(socket,'remoteRunFile',data))
		socket.on('cursorActivity',  data => bounce(socket,'cursorActivity',data))
		socket.on('mirrorChange',    data => bounce(socket,'mirrorChange',data))
		//right now, there's a function called on page load that fires this with current location.pathname.
		//it occurs to me that I could probably extract that from the socket object
		//and the only advantage here is that I can programmatically reconnect to a different room, which may or may not be useful
		socket.on('subscribe', function(data){
			socket.join(data.room);
			identities[socket.id].room = data.room;
			console.log(identities[socket.id])
		})



		// socket.on('identityRequest', function(req){
		// 	//I think each client's identity request will come in separately, when one user asks whoami and hits enter, the local browser will evaluate that and emit an identity request, so this message shouldn't be broadcast.
		// 	//req is the incoming message. socket is the particular connection.	
		// 	// console.log(identities[socket.id]);
		// 	socket.emit('identityResponse', {
		// 		placeHolderId: req.placeHolderId,
		// 		socketid: socket.id,
		// 		ipaddress: identities[socket.id].ip,
		// 		name: identities[socket.id].name
		// 	});
		// })


		// socket.on('timeRequest', function(req){
		// 	socket.emit('timeResponse', {
		// 		placeHolderId: req.placeHolderId,
		// 		serverTime: Date()
		// 	})
		// })

    //events to implement: identityRequest, timeRequest
})


