

!function () {

	"use strict";

	function PlayerModel (props) {

		"use strict";

		this.controller = props.controller;
		this.setSettings(props);
		this.setAudioContext();

		this.playlist = new global.Playlist(props);

		this.buildStartNodes();

		this.__mediaSources = [];

	};

	PlayerModel.prototype.setSettings = function (props) {
		this.settings = {
			'gain' : 1.0
		};
		this.states = {
			'play' : true
		};
		this.config = props.config;
	};

	PlayerModel.prototype.setAudioContext = function () {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		if (!window.AudioContext) {
			throw new Error("browser does not support Web Audion API");
		}

		this.context = new AudioContext();
	};

	PlayerModel.prototype.chooseSong = function (songModel) {

		this.freeNodeTree();

		if (this.config.audio.sourceNodeType == "MediaElementAudioSourceNode") {
			this.setAudioSource(songModel);
		}
		else if (this.config.audio.sourceNodeType == "AudioBufferSourceNode") {
			this.loadBuffer(songModel);
		}

	};

	PlayerModel.prototype.getAudioObject = function (props) { 
		var audio = new Audio();
		audio.src = props.url.replace(/&amp;/g, '&');
		audio.controls = true;
	  audio.autoplay = true;
	  audio.loop = true;

	  return audio;
	};

	PlayerModel.prototype.requestAudioSource = function (url, callback) {
		callback = callback || function () {};

		var audio, mediaSource;		

		this.__mediaSources.forEach(function (audioObject) {
			if (audioObject.url == url) {
				mediaSource = audioObject.source;
				audio = audioObject.audio;
			}
		});

		if (mediaSource) {			
			this.audioSource = audio;
			callback(mediaSource);
			return;
		}

		audio = this.audioSource = this.getAudioObject({
			'url' : url
		});

		var self = this;
		audio.addEventListener('loadeddata', function() {
      var mediaSource = self.context.createMediaElementSource(self.audioSource);

      self.__mediaSources.push({
				'source' : mediaSource,
				'audio' : audio,
				'url' : url
			});

			callback(mediaSource);

    },false);

	};

	PlayerModel.prototype.setAudioSource = function (songModel) {
		var url = songModel.path + "/" + songModel.name;

	  this.requestAudioSource(url, (function (source) {
	  	this.source = source;
	  	this.buildNodeTree();
	  }).bind(this));
	};

	PlayerModel.prototype.loadBuffer = function (songModel) {

		var self = this;

		var successCallback = function (response) {
			self.decodeAudioData(response);
		};
		var errorCallback = function (error) {
			console.log(error);
		};

		var url = songModel.path + "/" + songModel.name;

		global.fileLoader.ajaxSender({
			"url" : url,
			"type" : "GET",
			"dataType" : "arraybuffer",
			"success" : successCallback,
			"error" : errorCallback
		});
	};

	PlayerModel.prototype.decodeAudioData = function (ajaxResponse) {
		this.context.decodeAudioData(ajaxResponse, function (arrayBuffer) {
			this.buffer = arrayBuffer;
			this.source = this.context.createBufferSource();
			this.source.buffer = this.buffer;

			this.buildNodeTree();
		}.bind(this));
	};

	PlayerModel.prototype.freeNodeTree = function () {
		(this.source) && ('disconnect' in this.source) && (this.source.disconnect(0));
		// (this.analyser) && ('disconnect' in this.analyser) && (this.analyser.disconnect(0));
		// (this.gainNode) && ('disconnect' in this.gainNode) && (this.gainNode.disconnect(0));

		// this.controller('freeAnalyzer');
		
	};

	PlayerModel.prototype.buildNodeTree = function (source) {

		if (source) {
			this.source = source;
		}

		console.log(this.source);
		console.log(this.audioSource);
		console.log(this.audioSource.src);

		this.source.connect(this.gainNode);

		this.play();
	};

	PlayerModel.prototype.buildStartNodes = function () {
		this.gainNode = this.context.createGain();
		this.gainNode.gain.value = this.settings.gain;

		this.analyser = this.context.createAnalyser();

		this.destination = this.context.destination;

		this.gainNode.connect(this.analyser);
		this.analyser.connect(this.destination);

		this.controller('setAnalyser', this.analyser);
	};

	PlayerModel.prototype.play = function () {
		if (this.source instanceof MediaElementAudioSourceNode) {			
		  this.audioSource.play();
		}
		else if (this.source instanceof AudioBufferSourceNode) {
			this.source.start(0);
		}

		this.states.play = true;
	};

	PlayerModel.prototype.stop = function () {};

	PlayerModel.prototype.pause = function () {

		if (this.source instanceof MediaElementAudioSourceNode) {
			this.audioSource.pause();
		}
		else if (this.source instanceof AudioBufferSourceNode) {
			this.source.stop(0);
		}

		this.states.play = false;
	};

	PlayerModel.prototype.togglePlay = function () {
		if (this.states.play) {
			this.pause();
		}
		else {
			this.play();
		}
	};

	PlayerModel.prototype.setVolume = function (volume) {
		this.gainNode.gain.value = volume;
	};

	global.PlayerModel = PlayerModel;

} ();