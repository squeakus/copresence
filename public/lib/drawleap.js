(function(){
    uid = 0; // Unique ID for every user
    // settings for drawing the circle
    radius = 15;
    trail = false;
    drawpred = false;
    players = [[],[]];

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
            $('#username').text("Welcome user "+ data);
	    uid = data;
	});
	
	socket.on('message', function(data) {
            $('#messages').append('<li>' + data + '</li>');
	});
	
	socket.on('update', function(pos) {
	    x = Math.round(pos[0]);
	    y = Math.round(pos[1]);
	    z = Math.round(pos[2]);
            $('#location').text("Position x" + x + " y " + y + " z " + z);

	    //queue stores last known positions
	    queue.push([pos[0], pos[1]]);	    
	    if(queue.length > 4){
		queue.shift();
	    }

	    // use queue to draw next position
	    prediction = predict(queue);
	    drawcircle(prediction, "rgba(255,0,0,0.9)")
	});
    
	// transmit message on form submission
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
	// cover the canvas with a 10% opaque layer for fade out effect
	if(trail){
	    ctx.fillStyle = "rgba(200,200,200,0.1)";
	}
	else{
	    ctx.fillStyle = "rgba(200,200,200,1)";
	}
	ctx.fillRect(-canvas.width/2,
		     -canvas.height,
		     canvas.width,
		     canvas.height);

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
	
	// loop over the frame's pointables
	for (i=0, len=frame.hands.length; i<len; i++) {
	    // get the pointable and its position
	    pos = frame.hands[i].palmPosition;
	    socket.emit('newposition', pos);
	    drawcircle(pos, "rgba(0,0,255,0.9)");
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
