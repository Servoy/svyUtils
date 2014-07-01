var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var path = require('path');
var util = require('util');
var Transform = stream.Transform || require('readable-stream').Transform;

var args = process.argv.slice(2);
if(args.length < 2) {
	console.log('ServoyParser requires input directory and output directory as arguments.')
	return;
}

var WORKSPACE = args[0]	//'svyPayPal_instrumented';
var TEMP_WORKSPACE = path.resolve(args[1])	//'temp_' + WORKSPACE;
var WORKSPACE_PATH = path.resolve(WORKSPACE); // path.resolve(__dirname, '..\\..\\..\\..\\') 

console.log('WORKSPACE_PATH: ' + WORKSPACE_PATH)
console.log('dir ' + __dirname);
var workspaceFilesJS = [];		// the list of js files in workspace

// 1 get all js files in directory.
getFilesRecursiveSync(TEMP_WORKSPACE, workspaceFilesJS, isFileTypeJavascript);

// 2 edit all js files in directory.
readWorkspaceJSFileList();

/**
 * generate a random UUID. Note There is a possibility of fail.
 */
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

/**
 * read all files in directory.
 */
function getFilesRecursiveSync(dir, fileList, optionalFilterFunction) {
	//console.log('dir ' + dir + '  resolve ' + path.resolve(dir))
	if (!dir) {
		console.log("Directory 'dir' is undefined or NULL")
		return;
	}
    if (!fileList) {
        console.log("Variable 'fileList' is undefined or NULL.");
        return;
    }
    var files = fs.readdirSync(dir);
    for (var i in files) {
        if (!files.hasOwnProperty(i)) {
			continue;
		}
        var filePath = dir + '\\' + files[i];
        if (fs.statSync(filePath).isDirectory()) {		// search files in directory
		    if (filePath.substring(filePath.length-5, filePath.length) == '_test') {	// skip _test directories
				continue;
			}
            getFilesRecursiveSync(filePath, fileList, optionalFilterFunction);
        } else if (fs.statSync(filePath).isFile()) {		
            if (optionalFilterFunction && optionalFilterFunction(filePath) !== true)	// filter .js files only
                continue;
            fileList.push(filePath);	// push files into result object
			console.log(filePath)
        }
    }
}

/** 
 * returns true if the file in the specified path is a javascript file.
 */
function isFileTypeJavascript(path) {
	if (path.substring(path.length-3,path.length) == ".js") {
		return true
	} else {
		return false
	}
}
/*
 * process all js files.
 *
function readWorkspaceJSFileList() {

	for (var i=0; i<workspaceFilesJS.length; i++) {
		var inFilePath = workspaceFilesJS[i];
		var outFilePath = WORKSPACE_PATH + inFilePath.substring(TEMP_WORKSPACE.length);
		console.log('processing file: ' + outFilePath);
		
		// TODO bad performance. read all file in once.
		// copy the content into a different file.
		fs.readFile(inFilePath, {flags:"r", encoding: 'utf8', mode: 0666}, function (err, data) {
            if (err) { 
				return console.log(err) 
			}
            fs.writeFile(outFilePath, parseData(data), {flags:"w", encoding: 'utf8', mode: 0666}, function (wErr) {
				if(wErr) {
					console.log('ERROR IN WRITE FILE ' + wErr);
				}
            });
        });
	}
}
*/

function readWorkspaceJSFileList() {
                if (!workspaceFilesJS.length) {
                        return
                }

                var inFilePath = workspaceFilesJS.shift();
                var outFilePath = WORKSPACE_PATH + inFilePath.substring(TEMP_WORKSPACE.length) + '';
                console.log('processing file: ' + outFilePath);
				
                        // TODO bad performance. read all file in once.
                        // copy the content into a different file.
                        fs.readFile(inFilePath, {flags:"r", encoding: 'utf8', mode: 0666}, function (err, data) {
                                if (err) {
                                        return console.log(err)
                                }
                                var parsedContent = parseData(data)
                                // console.log('read ' + inFilePath)
								
                                var buffer = new Buffer(parsedContent)
                                fs.open(outFilePath, "w", "0666", function (err, fd) {
                                        if (err) {
                                                console.log(err);
                                                return;
                                        }
                                        // console.log('open ' + outFilePath)
                                        fs.write(fd, buffer, 0, buffer.length,null, function (wErr) {
                                                if(wErr) {
                                                        console.log('ERROR WRITING THE FILE ' + wErr);
                                                }
                                                // console.log('write ' + outFilePath)
                                                fs.close(fd, function () {console.log("completed " + outFilePath)})
                                        });
                                });

                                //writeStream.end()
//                              fs.writeFile(fd, parseData(data), {flags:"w", encoding: 'utf8',mode: 0666}, function (wErr) {
//                                      if(wErr) {
//                                              console.log('ERROR IN WRITE FILE ' + wErr);
//                                      }
//                              });

								//read next file
                                readWorkspaceJSFileList()

                        });
}


/** 
 * parse the content of the file. Return the parsed content.
 */
function parseData(data) { 
	var LEFT_CONTENT = "if (!__";
	var RIGHT_CONTENT = "/*"
	var parsedData = data;
	parsedData = parsedData.replace(RIGHT_CONTENT, "})();\n" + RIGHT_CONTENT);
	parsedData = '/**\n * @properties={typeid:35,uuid:"' + generateUUID() + '"} \n */' + parsedData;
	parsedData = parsedData.replace(LEFT_CONTENT, '\n/**\n * @properties={typeid:35,uuid:"' + generateUUID() + '"} \n */\nvar istanbul_init = (function (){ application.output("running istanbul code"); ' + LEFT_CONTENT)
	return parsedData;
}