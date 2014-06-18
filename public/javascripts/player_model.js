

!function () {

	"use strict";

	function PlayerModel (props) {

		"use strict";

		this.controller = props.controller;
		this.setSettings(props);
		this.setAudioContext();

		this.playlist = new global.Playlist(props);

		//

	};

	PlayerModel.prototype.setSettings = function (props) {
		this.settings = {
			'gain' : 0.4
		};
	};

	PlayerModel.prototype.setAudioContext = function () {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		if (!window.AudioContext) {
			throw new Error("browser does not support Web Audion API");
		}

		this.context = new AudioContext();
	};

	PlayerModel.prototype.chooseSong = function (songModel) {
		this.loadBuffer(songModel);
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
			this.playSong();
		}.bind(this));
	};

	PlayerModel.prototype.playSong = function () {
		this.source = this.context.createBufferSource();
		this.source.buffer = this.buffer;

		this.gainNode = this.context.createGain();
		this.gainNode.gain.value = this.settings.gain;

		this.analyser = this.context.createAnalyser();

		this.destination = this.context.destination;

		this.source.connect(this.gainNode);
		this.gainNode.connect(this.analyser);
		this.analyser.connect(this.destination);

		this.controller('setAnalyser', this.analyser);

		this.source.start(0);
	};

	PlayerModel.prototype.stopSong = function () {
		this.source.stop(0);
	};

	global.PlayerModel = PlayerModel;

} ();