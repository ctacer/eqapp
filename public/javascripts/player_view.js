

!function () {

	"use strict";

	function PlayerView () {
		this.setAnimationFraming();
		this.setOptions();
		this.setCanvasContext();
		this.setRenderFunction();
	}

	PlayerView.prototype.setAnimationFraming = function () {
		window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	};

	PlayerView.prototype.setCanvasContext = function () {
		this.frequencyCanvas = jQuery("#canvas").get(0);
		this.waveCanvas = jQuery("#wave").get(0);
		this.frequncyContext = this.frequencyCanvas.getContext("2d");
		this.waveContext = this.waveCanvas.getContext("2d");
	};

	PlayerView.prototype.setOptions = function () {
		this.options = {
			frequency: {
				'color' : '#8A3333',
				'lineCap' : 'round',
				'spacerWidth' : 4,
				'barWidth' : 3,
				'max': 255,
				'min' : 0
			},
			wave: {
				'color' : '#8A3333',
				'lineCap' : 'round',
				'spacerWidth' : 1,
				'barWidth' : 1,
				'max' : 250,
				'min' : 128
			},
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

	PlayerView.prototype.fixSizes = function (element, sizes) {
		sizes = sizes || {};
		element.height = sizes.height || jQuery(element).innerHeight() || 0;
		element.width = sizes.width || jQuery(element).innerWidth() || 0;
	};

	PlayerView.prototype.drawFrequencies = function (frequencies) {
		this.frequncyContext.clearRect(0, 0, this.frequencyCanvas.width, this.frequencyCanvas.height);
		this.frequncyContext.fillStyle = this.options.frequency.color;
		this.frequncyContext.lineCap = this.options.frequency.lineCap;

		var spacerWidth = this.options.frequency.spacerWidth;
		var numBars = Math.round(this.frequencyCanvas.width / spacerWidth);
		var barWidth = this.options.frequency.barWidth;
		var offset = Math.floor(frequencies.length / numBars);
		var frequencyCanvasHeight = this.frequencyCanvas.height;

		for (var i = 0; i < numBars; ++i) {
			var magnitude = frequencies[i*offset];
			var magnitude = this.scaleDomain(frequencies[i*offset], frequencyCanvasHeight, 'frequency');
			this.frequncyContext.fillRect(i * spacerWidth, frequencyCanvasHeight, barWidth, -magnitude);
		}
	}; 

	PlayerView.prototype.scaleDomain = function (value, height) {
		var newValue = height * (Math.abs(value - this.options.wave.min)) / (this.options.wave.max - this.options.wave.min) / 2;
		if (value < this.options.wave.min) {
			return height / 2 - newValue;
		}
		else {
			return height / 2 + newValue;
		}
	};

	PlayerView.prototype.scaleFrequency = function (value, height) {
		var newValue = height * (Math.abs(value - this.options.frequency.min)) / (this.options.frequency.max - this.options.frequency.min);
		if (value < this.options.frequency.min) {
			return 0;
		}
		else {
			return newValue;
		}
	};

	PlayerView.prototype.drawWave = function (domains) {
		this.fixSizes(this.waveCanvas);

		this.waveContext.clearRect(0, 0, this.waveCanvas.width, this.waveCanvas.height);
		this.waveContext.fillStyle = this.options.wave.color;
		this.waveContext.lineCap = this.options.wave.lineCap;

		var spacerWidth = this.options.wave.spacerWidth;
		var numBars = Math.round(this.waveCanvas.width / spacerWidth);
		var barWidth = this.options.wave.barWidth;
		var offset = Math.floor(domains.length / numBars);
		var waveCanvasHeight = this.waveCanvas.height;

		for (var i = 0; i < numBars; ++i) {
			var magnitude = this.scaleDomain(domains[i*offset], waveCanvasHeight, 'wave');
			this.waveContext.fillRect(i * spacerWidth, waveCanvasHeight - magnitude, barWidth, - 1);
			/*if (waveCanvasHeight - magnitude < 0 || waveCanvasHeight - magnitude > waveCanvasHeight) {
				console.log(domains[i*offset], magnitude);
			}*/
		}
	};

	PlayerView.prototype.setRenderFunction = function () {

		this.__renderFunction = (function () {

			window.requestAnimationFrame(this.__renderFunction);

			if (!this.analyser) {
				return;
			}

			var freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
			var domainByteData = new Uint8Array(this.analyser.fftSize);
			this.analyser.getByteFrequencyData(freqByteData);
			this.analyser.getByteTimeDomainData(domainByteData);

			this.drawFrequencies(freqByteData);
			this.drawWave(domainByteData);

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