
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
app.use(express.static(__dirname+ '/public'));
app.use(express.static(__dirname + '/public/savedTrees'));
app.use(express.static(path.join(__dirname, 'public/savedTrees'),{index:false,extensions:['html']}));
//app.get('/', function(req,res){
//    res.sendfile('./public/index.html');
//    
//})

app.post('/savethis', (req,res,next)=>{
	var htmlString = req.body.content;
	var fileName = req.body.fileName;
	fs.writeFile(path.join(__dirname, '/public/savedTrees/', fileName), htmlString, function(err){
		if(err){
			res.status(400).send(err);
		} else {
			let {size} = fs.statSync(path.join(__dirname, '/public/savedTrees/', fileName));
			res.status(200).send(formatBytes(size,1) + ' written successfully to ' + fileName);
		}
	})
})


app.post('/exec', (req,res,next)=>{
	let command = req.body.command;
	if(aCustomCommandMatches(command)){
		//cd is a special case, running it doesn't work, process.chdir has to be used instead
		if(command.indexOf('cd') === 0){
			try{
				process.chdir(command.split(' ')[1]);
				res.status(200).json({stdout: process.cwd()})
			} catch(e){
				res.status(404).json({err: 'cd errored out'})
			}
		} else {
			exec(command, (err,stdout,stderr)=>{
				res.status(200).json({err,stdout,stderr});
			})
		}
	} else {
		res.status(403).json({err: `"${command}" has not been whitelisted to run serverside`});
	}
	console.log(command)
})



app.get('/readFile', (req,res,next) => {
	console.log(req.query.pathname)
	let pathname = req.query.pathname;
	console.log(req.query.pathname);
	console.log(pathname);
	console.log(__dirname);
	console.log(path.join(__dirname, pathname));

	fs.readFile(path.join(__dirname, pathname), 'utf8' ,function(err,data){
		if(err){
			console.log(err)
			res.status(400).send(err);
		} else {
			res.json(data);
		}
	})
})

app.post('/fs', (req,res,next)=>{

	var pathname = '/';
	if(req.body.pathname !== 'undefined'){
			pathname = addSlashesIfNeedBe(req.body.pathname);
	} 
	
	fs.readdir(path.join(__dirname,pathname), function(err, files){
		if(err){
			res.status(204).send(err);
		} else {
			var result = {};
			for(each in files){
				var oneFile = files[each];
				if(oneFile[0] != '.'){             //if it's not hidden
					if(oneFile.indexOf('.') === -1){ //and if there's no extension
						result[files[each]] = 'directory';
					} else {
						switch(oneFile.split('.')[1].toLowerCase()){
							case 'js': result[files[each]] = 'text'; break;
							case 'css': result[files[each]] = 'text'; break;
							case 'html': result[files[each]] = 'text'; break;
							case 'txt': result[files[each]] = 'text'; break;
							case 'svg': result[files[each]] = 'image'; break;
							case 'png': result[files[each]] = 'image'; break;
							case 'jpg': result[files[each]] = 'image'; break;
							case 'gif': result[files[each]] = 'image'; break;
						}
					}
				}
			}

			res.status(200).json({pathname, result});
		// fileArr = fileArr.slice(1, fileArr.length - 1); //git rid of brackets
		// fileArr = fileArr.split(','); //convert to array
		// fileArr = fileArr.map(function(aFileName){return aFileName.slice(1,aFileName.length -1)});
		}
	})
	
})


io.on('connection', function(socket){
		identities[socket.id] = {ip: socket.client.conn.remoteAddress.split(':').slice(-1)[0], name: null};
    socket.on('event', function (data){
      socket.broadcast.emit('event',data);
    });
		socket.on('filesaveResult', function (data){
      socket.broadcast.emit('filesaveResult',data);
    });
		socket.on('remoteRunFile', function(data){
			socket.broadcast.emit('remoteRunFile', data)
		})
		socket.on('cursorActivity', function(data){
			socket.broadcast.emit('cursorActivity', data)
		})
		socket.on('mirrorChange', function(data){
			socket.broadcast.emit('mirrorChange', data)
		})
		

		socket.on('identityRequest', function(req){
			//I think each client's identity request will come in separately, when one user asks whoami and hits enter, the local browser will evaluate that and emit an identity request, so this message shouldn't be broadcast.
			//req is the incoming message. socket is the particular connection.	
			// console.log(identities[socket.id]);
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


function addSlashesIfNeedBe(aFilePath){
		if(aFilePath[0] !== '/'){
			aFilePath = '/' + aFilePath;
		}
		if(aFilePath[aFilePath.length - 1] !== '/'){
			aFilePath += '/'
		}
		return aFilePath;
	}
// socket.client.conn.remoteAddress reports the Public IP of the origin of the message
// socket.id reports the socket ID of the origin of the message. 

//Probably ought to be a utility or something
function aCustomCommandMatches(aPostedCommand){
	let arrValid = ['git status','git fetch','git pull','mkdir','touch','pwd','cd','ls'];
	return arrValid.some(validCommand => aPostedCommand.indexOf(validCommand) === 0)
}

//OK this one I ripped off stackoverflow: http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript#18650828
function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0 Byte';
   var k = 1000; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}