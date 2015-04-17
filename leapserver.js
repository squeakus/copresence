var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var usercount = 0;

//all libraries, css go in the public folder
app.use(express.static(__dirname + '/public'));

//send them the default page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// listen for position changes and transmit update
io.on('connection', function(socket){
    usercount += 1;
    console.log("new user, total:" + usercount)
    socket.emit('welcome',  usercount);

    socket.on('newposition', function(pos){
	console.log('newposition: ' + pos);
	io.emit('update', pos);
    });

    socket.on('disconnect', function() {
      console.log('Got disconnect!');
      usercount -= 1;
    });


});


// Send current time to all connected clients
function sendTime() {
    io.sockets.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
setInterval(sendTime, 10000);

http.listen(3000, function(){
  console.log('listening on *:3000');
});
