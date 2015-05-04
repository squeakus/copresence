var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userid = 0;
var usercount = 0;

//all libraries, css go in the public folder
app.use(express.static(__dirname + '/public'));

//send them the default page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// upon connection listen and transmit
io.on('connection', function(socket){
    usercount = userid + 1;
    console.log("new user at: " + new Date() + " total:" + usercount)
    socket.emit('welcome', usercount);
    userid += 1;

    // receive new leap position, transmit to everyone
    socket.on('newposition', function(pos){
	io.emit('update', pos);
    });

    // If comeone submits a chat message
    socket.on('message', function(data){
	uid = data[0];
	msg = data[1]
	console.log('msg from user ' + uid + ": " + msg);
	io.emit('message', "user " + uid + ": "+ msg);
    });

    // decrement users on disconnect
    socket.on('disconnect', function() {
      console.log('Disconnect at:' + new Date());
      usercount -= 1;
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
