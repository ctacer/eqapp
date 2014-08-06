

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
		this.__timeTicker;

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
		audio.controls = true;
	  // audio.autoplay = true;
	  // audio.loop = true;

		audio.src = props.url.replace(/&amp;/g, '&');
	  return audio;
	};

	PlayerModel.prototype.requestAudioSource = function (url, callback) {
		callback = callback || function () {};

		var audio, mediaSource;		

		this.__mediaSources.forEach(function (audioObject) {
			if (audioObject.url == url) {
				mediaSource = audioObject.source;
			}
		});

		if (mediaSource) {			
			this.audioSource = mediaSource.mediaElement;
			callback(mediaSource);
			return;
		}

		audio = this.audioSource = this.getAudioObject({
			'url' : url
		});

		audio.addEventListener('loadeddata', function () {
      var mediaSource = this.context.createMediaElementSource(this.audioSource);

      this.__mediaSources.push({
				'source' : mediaSource,
				'url' : url
			});

			callback(mediaSource);

    }.bind(this));

    audio.addEventListener('ended', function (event) {
    	this.controller("nextSong");
    }.bind(this));

	};

	PlayerModel.prototype.setAudioSource = function (songModel) {
		var url = songModel.path + "/" + songModel.name;

	  this.requestAudioSource(url, (function (source) {
	  	this.audioSource.currentTime = 0;
	  	this.source = source;
	  	this.buildNodeTree();

	  	this.playlist.songStarted(songModel);

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
	};

	PlayerModel.prototype.buildNodeTree = function (source) {

		if (source) {
			this.source = source;
		}

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
		this.playlist.setPlayingState({ 'playing' : true });
		this.setTimeTicker();
	};

	PlayerModel.prototype.setTimeTicker = function () {

			clearInterval(this.__timeTicker);
			this.__timeTicker = setInterval(function () {

				var currentTimePercentage = 0;
				var leftTime = 0;
				var lastTime = 0;

				if (!this.audioSource || !this.audioSource.currentTime) {
					this.playlist.tickAudioPosition({ 'position' : 0, 'left' : 0, 'last' : 0 });
					return;
				}

				leftTime = this.audioSource.currentTime;
				lastTime = this.audioSource.duration - this.audioSource.currentTime;

				currentTimePercentage = (this.audioSource.currentTime / this.audioSource.duration) * 100;
				currentTimePercentage = Math.floor(currentTimePercentage);
				this.playlist.tickAudioPosition({ 'position' : currentTimePercentage, 'left' : this.audioSource.currentTime, 'last' : lastTime });

			}.bind(this), 1000);

	};

	PlayerModel.prototype.clearTimeTicker = function () {
		clearInterval(this.__timeTicker);
	};

	PlayerModel.prototype.stop = function () {
		this.playlist.setPlayingState({ 'stoped' : true });
	};

	PlayerModel.prototype.pause = function () {

		if (this.source instanceof MediaElementAudioSourceNode) {
			this.audioSource.pause();
		}
		else if (this.source instanceof AudioBufferSourceNode) {
			this.source.stop(0);
		}

		this.states.play = false;
		this.playlist.setPlayingState({ 'paused' : true });
		this.clearTimeTicker();
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

	PlayerModel.prototype.setPosition = function (position) {
		this.audioSource.currentTime = position*this.audioSource.duration;
	};

	PlayerModel.prototype.nextSong = function () {
		this.playlist.nextSong();
	};

	PlayerModel.prototype.prevSong = function () {
		this.playlist.prevSong();
	};

	global.PlayerModel = PlayerModel;

} ();