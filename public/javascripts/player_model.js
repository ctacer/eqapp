

!function () {

	"use strict";

	/**
	 * PlayerModel constructor function - sets all default values 
	 */
	function PlayerModel (props) {

		this.controller = props.controller;
		this.setSettings(props);
		this.setAudioContext();

		this.playlist = new global.Playlist(props);

		this.buildStartNodes();

		this.audioSource = new Audio();
		this.source;

		this.privates = {};
		this.privates.timeTicker = 0;

	}

	/**
	 * function sets player settings
	 */
	PlayerModel.prototype.setSettings = function (props) {
		this.settings = {
			'gain' : 1.0
		};
		this.states = {
			'play' : true
		};
		this.config = props.config;
	};

	/**
	 * function sets audio context or throws an error if audio context is not supported
	 */
	PlayerModel.prototype.setAudioContext = function () {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		if (!window.AudioContext) {
			throw new Error("browser does not support Web Audion API");
		}

		this.context = new AudioContext();
	};

	/**
	 * function chooses a loading method depending on configuration
	 */
	PlayerModel.prototype.chooseSong = function (songModel) {

		this.freeNodeTree();

		if (this.config.audio.sourceNodeType === "MediaElementAudioSourceNode") {
			this.setMediaElement(songModel);
		}
		else if (this.config.audio.sourceNodeType === "AudioBufferSourceNode") {
			this.loadBuffer(songModel);
		}

	};

	/**
	 * function sets new audio source from given data
	 */
	PlayerModel.prototype.setAudioSource = function (props) {
		this.audioSource.controls = true;
	  
	  this.audioSource.preload = false;
		this.audioSource.src = props.url.replace(/&amp;/g, '&');
	  return this.audioSource;
	};

	/**
	 * function sets new audio source object, loads data 
	 * and fires a callback with just built media element
	 */
	PlayerModel.prototype.requestAudioSource = function (url, callback) {
		callback = callback || function () {};

		this.setAudioSource({ 'url' : url });

		this.audioSource.onloadeddata = function () {
			console.log('loadeddata');
      if (!this.source) {
      	this.source = this.context.createMediaElementSource(this.audioSource);
      }

      callback();

    }.bind(this);
	};

	/**
	 * function builds media element
	 */
	PlayerModel.prototype.setMediaElement = function (songModel) {
		var url = songModel.path + "/" + encodeURIComponent(songModel.name);

	  this.requestAudioSource(url, (function (source) {
	  	this.audioSource.currentTime = 0;
	  	this.buildNodeTree();

	  	this.playlist.songStarted(songModel);

	  }).bind(this));
	};

	/**
	 * function loads song as arraybuffer data type
	 */
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

	/**
	 * function decodes arraybuffer data and creates buffer source
	 */
	PlayerModel.prototype.decodeAudioData = function (ajaxResponse) {
		this.context.decodeAudioData(ajaxResponse, function (arrayBuffer) {
			this.buffer = arrayBuffer;
			this.source = this.context.createBufferSource();
			this.source.buffer = this.buffer;

			this.buildNodeTree();
		}.bind(this));
	};

	/**
	 * function disconnects media element from speakers
	 */
	PlayerModel.prototype.freeNodeTree = function () {
		(this.source) && ('disconnect' in this.source) && (this.source.disconnect(0));
	};

	/**
	 * function connects media element to the speakers
	 */
	PlayerModel.prototype.buildNodeTree = function (source) {
		if (source) {
			this.source = source;
		}

		this.source.connect(this.gainNode);
		this.play();
	};

	/**
	 * function builds initial node tree with gain - volume controller, 
	 * analyser - frequencies controller, destination - speakers
	 */
	PlayerModel.prototype.buildStartNodes = function () {
		this.gainNode = this.context.createGain();
		this.gainNode.gain.value = this.settings.gain;

		this.analyser = this.context.createAnalyser();

		this.destination = this.context.destination;

		this.gainNode.connect(this.analyser);
		this.analyser.connect(this.destination);

		this.controller('setAnalyser', this.analyser);
	};

	/**
	 * function initialaze playing of current audio source depending on sorce type
	 */
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

	/**
	 * function sets new ticker function for new playing song
	 * also sets new song ended listener
	 */
	PlayerModel.prototype.setTimeTicker = function () {

		this.audioSource.onended = function (event) {
    	this.controller("nextSong");
    }.bind(this);

		clearInterval(this.privates.timeTicker);
		this.privates.timeTicker = setInterval(function () {

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

	/**
	 * function clears time ticker and onended listeners
	 */
	PlayerModel.prototype.clearTimeTicker = function () {
		clearInterval(this.privates.timeTicker);
		this.audioSource.onended = function () { };
	};

	/**
	 * function initiates stop of the song
	 */
	PlayerModel.prototype.stop = function () {
		this.playlist.setPlayingState({ 'stoped' : true });
	};

	/**
	 * function initiates pause of the song
	 */
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

	/**
	 * function toggles song state between playing and pausing
	 */
	PlayerModel.prototype.togglePlay = function () {
		if (this.states.play) {
			this.pause();
		}
		else {
			this.play();
		}
	};

	/**
	 * function sets new volume value - affects gain audio node, not an audio source itself
	 */
	PlayerModel.prototype.setVolume = function (volume) {
		this.gainNode.gain.value = volume;
	};

	/**
	 * function sets playback position (time the song just played)
	 */
	PlayerModel.prototype.setPosition = function (position) {
		this.audioSource.currentTime = position * this.audioSource.duration;
	};

	/**
	 * function initiates next song playing
	 */
	PlayerModel.prototype.nextSong = function () {
		this.playlist.nextSong();
	};

	/**
	 * function initiates previous song playing
	 */
	PlayerModel.prototype.prevSong = function () {
		this.playlist.prevSong();
	};

	global.PlayerModel = PlayerModel;

} ();