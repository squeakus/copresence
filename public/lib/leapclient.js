(function(){
    'use strict';
    var socket = null; // the communications channel with the server
    var uid = null; // Unique ID for every user
    var radius = 15; // radius of the user circle
    var predsample = 4; // how many past positions are used to predict
    var predmult = 2; // the multiplier for the change
    var lag = 0; // manually introduced lag
    var predict = 0; //which prediction method to use (0 == none)
    var trail = false; // draw a fancy trail behind the player
    var playing = false; //only 2 players allowed at the moment
    var positions = [[],[]]; //holds all the players previous positions
    var predictions = [[],[]]; // holds all the predictions
    var starttime = Date.now(); // current time in milliseconds
    var now = starttime;
    var lastupdate = starttime; //last time other player sent an update 

    //This function is to scroll on the chat window
    window.setInterval(function() {
	var elem = document.getElementById('chat');
	elem.scrollTop = elem.scrollHeight;
    }, 1000);
    
    // get the canvas, 2d context, paragraph for data, set the radius
    var canvas = document.getElementsByTagName('canvas')[0];
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.lineWidth = 10;

    var info = document.getElementById('data');

    // set the canvas to cover the screen
    canvas.width = document.getElementById('section').clientWidth;
    canvas.height = document.getElementById('section').clientHeight;
    
    // move context co-ordinates to the bottom middle of the screen
    ctx.translate(canvas.width/2, canvas.height);
    
    function setupsockets() {    
	// connect to server and listen for the following events
	socket = io();
	socket.on('welcome', function(data) {
	    uid = data;
	    if(uid == 3){
		$('#username').text("Sorry two users already playing");
	    }
	    else{
		playing = true;
		$('#username').text("Welcome user "+ uid);
	    }
	});

	socket.on('new player', function(data) {
	    positions[data].push([0,0]);
            $('#messages').append('<li> New player '+data+'</li>');
	});
	
	socket.on('player left', function(data) {
            $('#messages').append('<li> Player ' + data + ' left</li>');
	});
	
	socket.on('message', function(data) {
            $('#messages').append('<li>' + data + '</li>');
	});

	socket.on('update', function(pos, userid) {
	    if (!(uid == userid)){
		// tidy the location data
		var x = Math.round(pos[0]);
		var y = Math.round(pos[1]);
		var z = Math.round(pos[2]);	

		var currenttime = Date.now() - starttime;
		// display the lag
		var tdiff = Date.now() - lastupdate;
		lastupdate = Date.now();				
		//$('#user2loc').text("Delay "+userid+": "+ String(tdiff));
		$('#user2loc').text("POS "+x+" "+y+" "+z);
		var player = positions[userid];
		player.push([x, y, currenttime]);
	    }
	});
    
	// Send text message from the form
	$('form').submit(function(){
	    socket.emit('message', [uid, $('#m').val()]);
	    $('#m').val('');
	    return false;
	});
    }

    function linearpredict(queue) {
	// basic moving average predictor
	var delta = [0,0,0];
	for (var i = 0; i < queue.length - 1; i++) {
	    for (var j = 0; j < queue[i].length; j++){
		delta[j] += queue[i][j] - queue[i+1][j];
	    }
	}

	var px = Math.round(delta[0] * 100) / 100;
	var py = Math.round(delta[1] * 100) / 100;
	var pz = Math.round(delta[2] * 100) / 100;
        $('#prediction').text("Prediction x" + px + " y " + py + " z " + pz);

	var newpos = [0,0,0];
	var lastpos = queue[0];
	for (i = 0; i < lastpos.length; i ++){
	    newpos[i] = lastpos[i] - ((delta[i])* predmult);
	}
	return newpos;
    }

    // polynomial regression based predictor, predicts one axis at a time.
    function polypredict(queue, axis, currenttime){
	degree = 3;
	// extract the axis you want to predict from the sample data
	var data = [];
	for (var i = 0; i < queue.length; i++) {    
	    var newcoord = [queue[i][2], queue[i][axis]];
	    data.push(newcoord);
	}

	// generate polynomial equation and use it to predict
	var polynomial = regression('polynomial', data, degree);
	var eqn = polynomial.equation;

	console.log("eqn: " + polynomial.string);
	var y = 0; // the equation defaults to y so we must use it
	for(i = 0; i < eqn.length; i++)
	{
	    var result = (eqn[i] * (Math.pow(currenttime, i)));
	    y = y + result;
	}
	return y;
    }

    function drawcircle(position, color) {
	// draw the circle for the leap location
	ctx.strokeStyle = color;
	var x = position[0] * 2;
	var y = position[1] * 2;
	var circx = x-radius/2;
	var circy = -(y-radius/2);

	// set the fill to white for the points
	ctx.beginPath();
	ctx.fillStyle = "rgba(255,255,255,0.9)";

	//centre of the circle, not the bottom right coord
	ctx.arc(circx ,circy ,radius,0,2*Math.PI);
	ctx.fill();
	ctx.lineWidth = 4;
	ctx.stroke();
    }

    function draw(controller) {
	var frame =  controller.frame();
	var fps = frame.currentFrameRate;
	$('#fps').text("fps "+fps);
	$('#fid').text("frame id "+frame.id);

	// set up data array and other variables
	var data = [],pos, i, len;
	    
	// cover the canvas with a 10% opaque layer for fade out effect
	if(trail){
	    ctx.fillStyle = "rgba(200,200,200,0.1)";
	}
	else{
	    ctx.fillStyle = "rgba(200,200,200,1)";
	}
	
	//draw white rectangle to clear the screen
	ctx.fillRect(-canvas.width/2,
		     -canvas.height,
		     canvas.width,
		     canvas.height);

	//only draw yourself if you are playing
	if (playing){
	    // loop over both hands (we are only using one)
	    for (i=0, len=frame.hands.length; i<len; i++) {
		// get the pointable and its position
		pos = frame.hands[i].palmPosition;

		//setInterval(function() {socket.emit('newposition', pos, uid);}, lag);
		socket.emit('newposition', pos, uid);

		var x = Math.round(pos[0]);
		var y = Math.round(pos[1]);
		var z = Math.round(pos[2]);
		// check the leap lag
		var tdiff = Date.now() - now;
		now = Date.now();		
		//$('#user1loc').text("Position: "+uid+": x "+x+" y "+y);
		$('#user1loc').text("Delay "+uid+": "+ String(tdiff));
		drawcircle(pos, "rgba(0,0,255,0.9)");
	    }
	}

	//draw the other players
	for(i=0; i < positions.length; i++) {
	    if (i != uid){	    
		var player =  positions[i];
		// draw prediction in green
		if (predict > 0){
		    // If there are enough positions make a prediction
		    var poslen = player.length;
		    if( poslen > predsample){
			var samples = player.slice(poslen - predsample, 
						   poslen);
			
			// use samples to draw next position
			if (predict == 1){
			    var prediction = linearpredict(samples);
			}
			if (predict == 2){
			    var ctime = Date.now() - starttime;
			    var predx  = polypredict(samples, 0, ctime);
			    var predy  = polypredict(samples, 1, ctime);
			    console.log("time "+ ctime +"newx " + predx + " newy " + predy);
			    var prediction = [predx, predy];
			    }
			predictions[i].push(prediction);
		    }
		    
		    if (predictions[i].length > 1){
			player =  predictions[i];
			pos = player[player.length -1];
			drawcircle(pos, "rgba(0,255,0,0.9)");
		    }
		}
		// or draw last known position in red 
		else{
		    if (positions[i].length > 1){
			var pos = player[player.length -1];
			drawcircle(pos, "rgba(255,0,0,0.9)");
		    }
		}
	    }
	}
    }
    
    // function to (poorly) simulate lag
    // function sleep(milliseconds) {
    // 	var start = new Date().getTime();
    // 	for (var i = 0; i < 1e7; i++) {
    // 	    if ((new Date().getTime() - start) > milliseconds){
    // 		break;
    // 	    }
    // 	}
    // }

    function keylistener(){
	document.addEventListener('keydown', function(event) {
	    // right arrow increases the sample size
	    if (event.keyCode == 39) {
		predsample = predsample + 1;
		$('#messages').append('<li> samples: '+predsample+'</li>');
	    }

	    // left arrow reduces the sample size
	    else if (event.keyCode == 37) {
		if (predsample > 1){
		    predsample = predsample - 1;
		    $('#messages').append('<li> samples: '+predsample+'</li>');
		}
	    }

	    // up arrow increase circle size
	    else if (event.keyCode == 38) {
		if (radius < 50){
		    radius += 1;
		}
	    }
	    // down arrow decrease circle size
	    else if (event.keyCode == 40) {
		if (radius > 5){
		    radius -= 1;
		}
	    }
	    // t switches trail
	    else if (event.keyCode == 84) {
		trail = !(trail);
	    }

	    // plus(+) increases the prediction multiplier
	    else if (event.keyCode == 107) {
		predmult = predmult + 0.1;
		$('#messages').append('<li> Multiplier: '+predmult+'</li>');
	    }

	    // minus(-) decreases the prediction multiplier
	    else if (event.keyCode == 109) {
		if (predmult > 0.5){
		    predmult = predmult - 0.1;
		    $('#messages').append('<li> Multiplier: '+predmult+'</li>');
		}
	    }

	    // w increases the lag
	    else if (event.keyCode == 87) {
		lag = lag + 10;
		$('#messages').append('<li> lag: '+lag+'</li>');
	    }

	    // s decreases the lag
	    else if (event.keyCode == 83) {
		if (lag > 0){
		    lag = lag - 10;
		    $('#messages').append('<li> lag: '+lag+'</li>');
		}
	    }

	    // p switches prediction 
	    else if (event.keyCode == 80) {
		predict = (predict + 1) % 3;
		$('#messages').append('<li> Prediction: '+predict+'</li>');
	    }
	}, true);
    }
    setupsockets();
    keylistener();

    //a polypredict test
    //var data = [[100,10,1000],[200,20,2000],[300,30,3000],[400,40,4000]];
    //var data = [[100,10,1],[200,20,2],[300,30,3],[400,40,4]];  
    //var a = polypredict(data,0,5);
    //var b = polypredict(data,1,5);
    //console.log("RESULT: "+a+ " "+b);

    // connect to leap and draw
    var controller = new Leap.Controller();
    controller.connect();
    // 20 milliseconds is 60fps
    setInterval(function() {draw(controller);}, 20);
})();
