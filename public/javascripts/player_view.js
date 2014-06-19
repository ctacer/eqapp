

!function () {

	"use strict";

	function PlayerView () {
		this.setAnimationFraming();
		this.setOptions();
		this.setCanvasContext();
		this.setRenderFunction();
	};

	PlayerView.prototype.setAnimationFraming = function () {
		window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	};

	PlayerView.prototype.setCanvasContext = function () {
		this.canvas = jQuery("#canvas").get(0);
		this.context = this.canvas.getContext("2d");
	};

	PlayerView.prototype.setOptions = function () {
		this.options = {
			'color' : '#8A3333',
			'lineCap' : 'round',
			'spacerWidth' : 4,
			'barWidth' : 2,
			'offset' : 4
		};

		this.__states = {
			'render' : false
		};
	};

	PlayerView.prototype.chooseSong = function () {
		//
	};

	PlayerView.prototype.stopRender = function () {

	};

	PlayerView.prototype.setRenderFunction = function () {

		this.__renderFunction = (function () {

			window.requestAnimationFrame(this.__renderFunction);

			if (!this.analyser) {
				return;
			}

			var freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
			this.analyser.getByteFrequencyData(freqByteData);

			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.fillStyle = this.options.color;
			this.context.lineCap = this.options.lineCap;

			var spacerWidth = this.options.spacerWidth;
			var numBars = Math.round(this.canvas.width / spacerWidth);
			var barWidth = this.options.barWidth;
			var offset = this.options.offset;
			var canvasHeight = this.canvas.height;

			for (var i = 0; i < numBars; ++i) {
				var magnitude = freqByteData[i*offset];
				this.context.fillRect(i * spacerWidth, canvasHeight, barWidth, -magnitude);
			}

		}).bind(this);

	};

	PlayerView.prototype.render = function () {

		if (this.__states.render) {
			return;
		}
		else {
			this.__states.render = true;
			window.requestAnimationFrame(this.__renderFunction);
		}

	};

	global.PlayerView = PlayerView;

} ();