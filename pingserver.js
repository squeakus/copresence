var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var now = Date.now();
var playercount = 0;
//all libraries, css go in the public folder
app.use(express.static(__dirname + '/public'));

//send them the default page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/pingtest.html');
});

// upon connection listen and transmit
io.on('connection', function(socket){
    console.log("new user at: " + new Date());
    socket.emit('welcome', playercount);
    playercount = playercount + 1;

    // receive new leap position, transmit to everyone
    socket.on('ping', function(token, uid){
	console.log('ping from user ' + uid + ": " + token);
	io.emit('pingack', [token, uid]);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
