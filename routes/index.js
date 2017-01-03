const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs')
const exec = require('child_process').exec

router.use(express.static(path.join(__dirname, '..', '/public')));
router.use(express.static(path.join(__dirname, '..', '/public/savedTrees')));
router.use(express.static(path.join(__dirname, '..',  'public/savedTrees'),{index:false,extensions:['html']}));

router.post('/savethis', (req,res,next)=>{
	var htmlString = req.body.content;
	var fileName = req.body.fileName;
	fs.writeFile(path.join(__dirname, '..',  '/public/savedTrees/', fileName), htmlString, err => {
		if(err){
			res.status(400).send(err);
		} else {
			let {size} = fs.statSync(path.join(__dirname, '..',  '/public/savedTrees/', fileName));
			if(!(size === htmlString.length)){
				console.log('Filesize mismatched string length, some characters were not 8 bit char. ')
			}
			console.log(`${size} bytes saved to disk.`)
			console.log(`${htmlString.length} characters saved to disk.`)
			console.log(`${formatBytes(size,1)} written successfully to ${fileName}`)
			res.status(200).send(`${formatBytes(size,1)} written successfully to ${fileName}`);
		}
	})
})

router.post('/saveText', (req,res,next) => {
	console.log(req.body);
	fs.writeFile(path.join(__dirname, '../', req.body.filename ), req.body.text, err => {
			err ? res.sendStatus(400) :	res.sendStatus(200);
	})
})

router.post('/exec', (req,res,next)=>{
	/*
	The process for running commands once they reach the server - these requests will be sent if they were included in the custom commands object, 
	but this should also gaurd against arbitrary post requests (not from a faithful client, I mean)
	So, there are some commands like 'cd' that require a special node routine
	there are some commands that exist only on windows or linux, which should be matched according to server side OS: ls -> dir, touch -> type NUL >>, 
	
	*/
	let command = req.body.command;
	if(aCustomCommandMatches(command)){
		if(process.env.OS && process.env.OS.includes('Windows') && ['touch','ls'].some(each => command.indexOf(each) === 0)){
			switch(command.split(' ')[0]){
				case 'ls': exec('dir', (err,stdout,stderr)=>{
						res.status(200).json({err,stdout,stderr});
				}); break;
				case 'touch': exec(`type NUL >> ${command.split(' ')[1]}`, (err,stdout,stderr)=>{
					res.status(200).json({err,stdout,stderr});
				}); break;
			}
		//cd is a special case, running it doesn't work, process.chdir has to be used instead
		} else if(command.indexOf('cd') === 0){
				changeDir(command)
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

function changeDir(command){
		try{
			process.chdir(command.split(' ')[1]);
			res.status(200).json({stdout: process.cwd()})
		} catch(e){
			res.status(404).json({err: 'cd errored out'})
		}
}



router.get('/readFile', (req,res,next) => {
	console.log(req.query.pathname)
	let pathname = req.query.pathname;
	pathname = path.join(__dirname, '..', pathname);

	fs.readFile(pathname, 'utf8', (err, data) => {
		if(err){
			console.log(err)
			res.status(400).send(err);
		} else {
			res.json(data);
		}
	})
})

router.post('/fs', (req,res,next)=>{

	var pathname = '/';
	if(req.body.pathname !== 'undefined'){
			pathname = addSlashesIfNeedBe(req.body.pathname);
	} 
	
  var dirtoread = path.join(__dirname, '..', pathname)

	fs.readdir(dirtoread, function(err, files){

		if(err){
			res.status(204).send(err);
		} else {
			var result = {};
			for(each in files){
				var oneFile = files[each];
				console.log(oneFile)
				
				if(oneFile[0] != '.'){             //if it's not hidden
					if(fs.fstatSync(fs.openSync(path.join(dirtoread,oneFile),'r')).isDirectory()){ //if its a directory
						result[files[each]] = 'directory';
					} else if (oneFile.indexOf('.') === -1){
							result[files[each]] = 'unknown';
					} else {
						switch(oneFile.split('.')[1].toLowerCase()){
							case 'js': result[files[each]] = 'text'; break;
							case 'json': result[files[each]] = 'text'; break;
							case 'css': result[files[each]] = 'text'; break;
							case 'html': result[files[each]] = 'markup'; break;
							case 'txt': result[files[each]] = 'text'; break;
							case 'svg': result[files[each]] = 'markup'; break;
							case 'png': result[files[each]] = 'image'; break;
							case 'jpg': result[files[each]] = 'image'; break;
							case 'gif': result[files[each]] = 'image'; break;
							default: result[files[each]] = 'unknown'; break;
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

router.get('/:notYetAFile', function(req,res){
   res.sendFile(path.join(__dirname, '..',  '/public/index.html'));
})

module.exports = router;

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
	let arrValid = ['cat', 'git log', 'git status','git fetch','git pull','git clone', 'git add', 'git commit', 'git push','mkdir','touch','pwd','cd','ls'];
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