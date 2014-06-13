

function PlayerView () {
	this.setAnimationFraming();
	this.setOptions();
};

PlayerView.prototype.setAnimationFraming = function () {
	window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
};

PlayerView.prototype.setOptions = function () {
	this.options = {
		'color' : '#8A3333',
		'lineCap' : 'round',
		'spacerWidth' : 4,
		'barWidth' : 2,
		'offset' : 4
	};
};

PlayerView.prototype.chooseSong = function () {
	//
};

PlayerView.prototype.render = function () {

	var renderFunction = (function () {

		window.requestAnimationFrame(renderFunction); 
      
		var freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(freqByteData);

		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.fillStyle = this.options.color;  
		ctx.lineCap = this.options.lineCap;

		var spacerWidth = this.options.spacerWidth;
		var numBars = Math.round(this.canvas.width / spacerWidth);  
		var barWidth = this.options.barWidth;
		var offset = this.options.offset; 
		var canvasHeight = this.canvas.height;

		for (var i = 0; i < numBars; ++i) {
			var magnitude = freqByteData[i*offset];
			ctx.fillRect(i * spacerWidth, canvasHeight, barWidth, -magnitude);
		}

	}).bind(this);
	
	window.requestAnimationFrame(renderFunction);

};