function linearpredict(queue) {
    // basic moving average predictor
    var delta = [0,0,0];
    var predmult = 2; // the multiplier for the change

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
    // how many coefficients in the polynomial
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