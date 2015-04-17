var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//specifying the framework
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// listen for position changes and transmit update
io.on('connection', function(socket){
  socket.on('newposition', function(msg){
    console.log('newposition: ' + msg);
    io.emit('update', msg);
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
