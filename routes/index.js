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
	fs.writeFile(path.join(__dirname, '..',  '/public/savedTrees/', fileName), htmlString, function(err){
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


router.post('/exec', (req,res,next)=>{
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



router.get('/readFile', (req,res,next) => {
	console.log(req.query.pathname)
	let pathname = req.query.pathname;
	console.log(req.query.pathname);
	console.log(pathname);
	console.log(path.join(__dirname, '..' ));
	console.log(path.join(__dirname, '..',  pathname));

	fs.readFile(path.join(__dirname, '..',  pathname), 'utf8' ,function(err,data){
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
	
	fs.readdir(path.join(__dirname, '..', pathname), function(err, files){
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