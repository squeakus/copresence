var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var allClients = [];

//all libraries, css go in the public folder
app.use(express.static(__dirname + '/public'));

//send them the default page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// upon connection listen and transmit
io.on('connection', function(socket){
    allClients.push(socket);
    var i = allClients.indexOf(socket);
    console.log("new user at: " + new Date() + " total: " + i)
    socket.emit('welcome', i);

    // receive new leap position, transmit to everyone
    socket.on('newposition', function(pos){
	io.emit('update', pos);
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
	delete allClients[i];
	console.log('User ' + i +' disconnected:' + new Date());

 });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
