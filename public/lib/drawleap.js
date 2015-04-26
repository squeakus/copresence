(function(){
    uid = 0; // Unique ID for every user
    window.setInterval(function() {
	var elem = document.getElementById('chat');
	elem.scrollTop = elem.scrollHeight;
    }, 1000);
    
    // get the canvas, 2d context, paragraph for data and set the radius
    canvas = document.getElementsByTagName('canvas')[0],
    ctx = canvas.getContext('2d'),
    info = document.getElementById('data'),
    // set the canvas to cover the screen
    canvas.width = document.getElementById('section').clientWidth;
    canvas.height = document.getElementById('section').clientHeight;
    
    // move the context co-ordinates to the bottom middle of the screen
    ctx.translate(canvas.width/2, canvas.height);
    
    // settings for drawing the circle
    radius = 10;
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.lineWidth = 5;
    
    // set up the socket and listen for the following events
    socket = io();
    
    socket.on('welcome', function(data) {
        $('#username').text("Welcome user "+ data);
	uid = data;
    });

    socket.on('message', function(data) {
        $('#messages').append('<li>' + data + '</li>');
    });

    socket.on('update', function(pos) {
        $('#location').text(pos);
	drawcircle(pos, "rgba(0,255,0,0.9)")
    });
    
    // transmit message on form submission
    $('form').submit(function(){
    socket.emit('message', [uid, $('#m').val()]);
    $('#m').val('');
    return false;
    });


    function drawcircle(pos, color) {
	ctx.strokeStyle = color;
	// cover the canvas with a 10% opaque layer for fade out effect.
	ctx.fillStyle = "rgba(255,255,255,0.1)";
	ctx.fillRect(-canvas.width/2,-canvas.height,canvas.width,canvas.height);
	// set the fill to black for the points
	ctx.fillStyle = "rgba(0,0,0,0.9)";

	// draw the circle where the pointable is
	ctx.beginPath();
	x = pos[0];
	y = pos[1];

	newx = x-radius/2;
	newy = -(y-radius/2);
	ctx.arc(newx ,newy ,radius,0,2*Math.PI);
	ctx.fill();
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
	    console.log(pos);
	    // add the position data to our data array
	    data.push(pos);
	    drawcircle(pos, "rgba(0,0,255,0.9)");
	}
    };

    document.addEventListener('keydown', function(event) {
    if (event.keyCode == 37) {
        radius += 1;

    }
    else if (event.keyCode == 39) {
	if (radius > 5){
            radius -= 1;
	}
    }
}, true);

  // run the animation loop with the draw command
  Leap.loop(draw);
})();
