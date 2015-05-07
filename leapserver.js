var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
//only two for the moment
var allClients = [null,null];

//all libraries, css go in the public folder
app.use(express.static(__dirname + '/public'));

//send them the default page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// upon connection listen and transmit
io.on('connection', function(socket){
    if (allClients[0] == null){
	allClients[0] = socket;
	console.log("new user 0 at: " + new Date());
	socket.emit('welcome', 0);
	io.emit('new player', 0);
    }
    else if (allClients[1] == null){
	allClients[1] = socket;
	console.log("new user 1 at: " + new Date());
	socket.emit('welcome', 1);
	io.emit('new player', 1);
    }
    else {
	socket.emit('welcome', 3);
    }

    // receive new leap position, transmit to everyone
    socket.on('newposition', function(pos, userid){
	io.emit('update', pos, userid);
    });

    // If comeone submits a chat message
    socket.on('message', function(data){
	uid = data[0];

	msg = data[1];
	console.log('msg from user ' + uid + ": " + msg);
	io.emit('message', "user " + uid + ": "+ msg);
    });

    // decrement users on disconnect
    socket.on('disconnect', function() {
	var i = allClients.indexOf(socket);
	io.emit('player left', i);
	allClients[i] = null;
	console.log('User ' + i +' disconnected:' + new Date());
 });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
