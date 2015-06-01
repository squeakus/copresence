(function(){
    uid = 0; // Unique ID for every user
    tdiff = 0;
    now = Date.now(); // current time in milliseconds
    lastupdate = Date.now(); //last time other player sent an update   
    token = 0;

    function setupsockets() {    
	// connect to server and listen for the following events
	socket = io();
	socket.on('welcome', function(data) {
            $('#messages').append('<li>Connected</li>');
	    uid = data;
	});
	
	socket.on('pingack', function(data) {
	    tdiff = Date.now() - lastupdate;
	    lastupdate = Date.now();		

            $('#messages').append('<li> Ping reply: ' + data[0] + ' Time taken: '+tdiff+'</li>');
	    if (!(token == data[0])){
		$('#messages').append('<li> <font color="red">Missing message!</font></li>');
	    }
	});
    }   
    setupsockets();

    //This function is to scroll on the chat window
    window.setInterval(function() {
	token = token + 1;
	socket.emit('ping', token , uid);
        $('#messages').append('<li>PING: ' + token + '</li>');
    }, 3000);


})();
