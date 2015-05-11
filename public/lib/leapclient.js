(function(){
    uid = 0; // Unique ID for every user
    radius = 15; // radius of the user circle
    predsample = 4; // how many past positions are used to predict
    drawpred = false; //draw the prediction rather than the position
    trail = false; // draw a fancy trail behind the player
    playing = false; //only 2 players allowed at the moment
    positions = [[],[]]; //holds all the players previous positions
    predictions = [[],[]]; // holds all the predictions

    //This function is to scroll on the chat window
    window.setInterval(function() {
	var elem = document.getElementById('chat');
	elem.scrollTop = elem.scrollHeight;
    }, 1000);
    
    // get the canvas, 2d context, paragraph for data, set the radius
    canvas = document.getElementsByTagName('canvas')[0];
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.lineWidth = 10;

    info = document.getElementById('data');

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
		player = positions[userid];
		x = Math.round(pos[0]);
		y = Math.round(pos[1]);
		z = Math.round(pos[2]);	
		$('#user2loc').text("Position: "+userid+": x " + x + " y " + y + " z " + z);
		player.push([x,y]);

		// If there are enough positions make a prediction
		poslen = player.length;
		console.log("poslen"+poslen+" samplesize"+predsample);
		if( poslen > predsample){
		    samples = player.slice(poslen - predsample, 
					      poslen);

		    // use samples to draw next position
		    prediction = predict(samples);
		    predictions[userid].push(prediction);
		}
	    }
	});
    
	// Send text message from the form
	$('form').submit(function(){
	    socket.emit('message', [uid, $('#m').val()]);
	    $('#m').val('');
	    return false;
	});
    }

    function predict(queue) {
	delta = [0,0,0];
	for (i = 0; i < queue.length - 1; i++) {
	    for (j = 0; j < queue[i].length; j++)
		delta[j] += queue[i][j] - queue[i+1][j];
	}
	px = Math.round(delta[0] * 100) / 100;
	py = Math.round(delta[1] * 100) / 100;
	pz = Math.round(delta[2] * 100) / 100;
        $('#prediction').text("Prediction x" + px + " y " + py + " z " + pz);

	newpos = [0,0,0];
	lastpos = queue[0];
	for (i = 0; i < lastpos.length; i ++){
	    newpos[i] = lastpos[i] - ((delta[i])*2);
	}
	return newpos;
    }

    function drawcircle(position, color) {
	ctx.strokeStyle = color;

	// draw the circle where the pointable is
	x = position[0] * 2;
	y = position[1] * 2;
	circx = x-radius/2;
	circy = -(y-radius/2);

	// set the fill to white for the points
	ctx.beginPath();
	ctx.fillStyle = "rgba(255,255,255,0.9)";

	//centre of the circle, not the bottom right coord
	ctx.arc(circx ,circy ,radius,0,2*Math.PI);
	ctx.fill();
	ctx.lineWidth = 4;
	ctx.stroke();
    };

    function draw(frame) {
	// set up data array and other variables
	var data = [],
        pos, i, len;
	    
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
		socket.emit('newposition', pos, uid);
		x = Math.round(pos[0]);
		y = Math.round(pos[1]);
		z = Math.round(pos[2]);
		$('#user1loc').text("Position: "+ uid +": x " + x + " y " + y + " z " + z);
		drawcircle(pos, "rgba(0,0,255,0.9)")
	    }
	}
	//draw the other players
	for(i=0; i < positions.length; i++) {
	    if (i != uid){	    
		// draw prediction in green
		if (drawpred){
		    console.log("drawpred"+drawpred);
		    
		    if (predictions[i].length > 1){
			player =  predictions[i];
			pos = player[player.length -1];
			console.log(pos);
			drawcircle(pos, "rgba(0,255,0,0.9)");
		    }
		}
		// or draw last known position in red 
		else{
		    if (positions[i].length > 1){
			player =  positions[i];
			pos = player[player.length -1];
			drawcircle(pos, "rgba(255,0,0,0.9)");
		    }
		}
	    }
	}
    };
    
    function keylistener(){
	document.addEventListener('keydown', function(event) {
	    // up arrow increase circle size
	    if (event.keyCode == 38) {
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
	    // p switches prediction 
	    else if (event.keyCode == 80) {
		drawpred = !(drawpred);
	    }
	}, true);
    }
    
    setupsockets();
    keylistener();
    // run the animation loop with the draw command
    Leap.loop(draw);
})();
