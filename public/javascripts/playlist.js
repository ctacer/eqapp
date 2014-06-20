

!function () {
	
	"use strict";

	function PlaylistModel (controller) {
		
		this.controller = controller || function () {};

		this.played = [];
		this.playing = null;

    this.modes = {
    	'shuffle' : false,
    	'loopSong' : false,
    	'loopPlaylist' : false
    };
	}

	PlaylistModel.prototype.initialize = function () {
		this.loadPlaylist();
	};

	PlaylistModel.prototype.playlistModelBuilder = function (playlist) {
  	return playlist.files.map(function (file) {
  		return {'name' : file, 'path' : playlist.path, 'folder' : playlist.folderName };
  	});
  };

  PlaylistModel.prototype.buildPlaylistModel = function (playlist) {
  	var self = this;

  	var array = this.playlistModelBuilder(playlist);
  	playlist.folders.forEach(function (folder) {
  		array = array.concat(self.playlistModelBuilder(folder));
  	});

  	return array;
  };

  PlaylistModel.prototype.buildModel = function (playlist) {
  	this.playlist = this.buildPlaylistModel(playlist);
  	this.setFirstSong();
  };

  PlaylistModel.prototype.shuffle = function () {
  	this.modes.shuffle = !this.modes.shuffle;
  };
  PlaylistModel.prototype.loopSong = function () {
  	this.modes.loopSong = !this.modes.loopSong;
  };
  PlaylistModel.prototype.loopPlaylist = function () {
  	this.modes.loopPlaylist = !this.modes.loopPlaylist;
  };

  PlaylistModel.prototype.getNextSong = function () {
  	if (this.played.length < this.playlist.length - 1) {
  		//this.playing = //next
      //throwNextSong()
  	}
  };
  PlaylistModel.prototype.getPrevSong = function () {};

  PlaylistModel.prototype.throwNextSong = function () {
    var selector = 
      ".playlist-trek" + 
      "[data-path=\"" +this.playing.path + "\"]" +
      "[data-folder=\"" +this.playing.folder + "\"]" +
      "[data-name=\"" +this.playing.name + "\"]";

    var folder = jQuery(selector).parents(".playlist-item");
    if (!folder.hasClass("active")) {
      folder.trigger('click');
    }
    jQuery(selector).trigger('click');
  };

  PlaylistModel.prototype.setFirstSong = function () {
  	if (this.playlist.length) {
  		this.playing = this.playlist[0];
      this.throwNextSong();
  	}
  };

	function PlaylistView (controller) {
		this.controller = controller || function () {};		
	}

	PlaylistView.prototype.initialize = function (callback) {
		this.loadTemplates(callback);
	};

	PlaylistView.prototype.setFolderExpandingEvents = function () {
		var handler = function () {
			jQuery(this).parents(".playlist-item[data-folder=\"" + jQuery(this).attr("data-folder") + "\"]").toggleClass('active');
		};
		jQuery(".playlist-item-folder").off('click').on('click', handler);
	};
	
	PlaylistView.prototype.throwSongEvent = function (songElement) {
		var songModel = {
			'name' : songElement.attr('data-name'),
			'path' : songElement.attr('data-path'),
			'folder' : songElement.attr('data-folder')
		};

		this.controller('chooseSong', songModel);
	};
	
	PlaylistView.prototype.setSongChooseEvents = function () {
		var self = this;

		var handler = function () {
			jQuery('.playlist-trek').removeClass('active');
			jQuery(this).addClass('active');

			self.throwSongEvent(jQuery(this));
		};
		jQuery('.playlist-trek').off('click').on('click', handler);
	};

  PlaylistView.prototype.setPauseEvents = function () {
    var self = this;

    var handler = function (event) {
      if (event.keyCode == 32) {
        self.controller('togglePlay');
      }
    };
    jQuery('body').on('keydown', handler);

    jQuery('#player-play-pause-button').off('click').on('click', function () {
      handler.call(this, { 'keyCode' : '32' });
    });
  };

  var getRangeValue = function () {
    var max = parseInt(jQuery(this).attr('max'));
    var min = parseInt(jQuery(this).attr('min'));
    var val = parseInt(jQuery(this).val());

    return val / (max - min);
  };

  PlaylistView.prototype.setPlayerVolumeEvents = function () {
    var self = this;

    var handler = function () {
      var volume = getRangeValue.call(this);
      self.controller('setVolume', volume);
    };
    jQuery("#player-volume-range").off('change').on('change', handler);
  };

  PlaylistView.prototype.setPlayerPositionEvents = function () {
    var self = this;

    var handler = function () {
      var position = getRangeValue.call(this);
      self.controller('setPosition', position);
    };
    jQuery("#player-position-range").off('change').on('change', handler);
  };

  PlaylistView.prototype.tickAudioPosition = function (position) {
    jQuery("#player-position-range").val(position);
  };

	PlaylistView.prototype.setPlaylistEvents = function () {
		this.setFolderExpandingEvents();
		this.setSongChooseEvents();
    this.setPauseEvents();
    this.setPlayerVolumeEvents();
    this.setPlayerPositionEvents();
	};

	PlaylistView.prototype.fillTemplate = function (template, playlist) {
    jQuery(template).attr("data-folder", playlist.folderName);	
    jQuery(template).find(".playlist-item-folder")
    	.attr("data-folder", playlist.folderName)
    	.text(playlist.folderName);	
    playlist.files.forEach(function (fileName) {
      jQuery(template).find(".playlist-item-body").append(
      	"<div " + 
      		"data-path=\"" + playlist.path + "\" " +  
      		"data-name=\"" + fileName + "\" " +
      		"data-folder=\"" + playlist.folderName + "\" " +
      		"class=\"playlist-trek\" " +
    		">" + fileName + "</div>"
    	);
    });    
  };  
  
  PlaylistView.prototype.buildView = function (playlist) {
  	this.buildPlaylist(playlist);
  	this.setPlaylistEvents();
  };

  PlaylistView.prototype.buildPlaylist = function (playlist, jParent) {
    var self = this;

    var template = jQuery(this.templates.playlistItem);
    if (!jParent) {
      template.addClass("active");
    }
    jParent = jParent || jQuery("#player-playlist-container");
    this.fillTemplate(template, playlist);
    jParent.append(template);
    playlist.folders.forEach(function (folder) {
      self.buildPlaylist(folder, template.find('.playlist-item-body'));
    });
  };

  PlaylistView.prototype.loadTemplates = function (callback) {

    var self = this;
    self.templates = {};
    var templates = [ { 'url' : '/templates/playlist_item.html', 'type' : 'playlistItem' } ];

    var templateHandler = function (templateItem, cb) {
      jQuery.get(templateItem.url, function (result) {
        self.templates[templateItem.type] = result;
        cb && cb();
      });      
    };

    async.each(templates, templateHandler, function (error, result) {
      if (error) {
        console.error(error);
        return;
      }

      callback && callback();
      
    });    
  };


	function Playlist (props) {

    this.config = props.config;
    
    this.playlistView = new PlaylistView(props.controller);
    this.playlistModel = new PlaylistModel(props.controller);

    var self = this;
    var proceedModel = function () {
    	self.loadPlaylist();
    };
    this.playlistView.initialize(proceedModel);

  }

  Playlist.prototype.shuffle = function () {
  	this.modes.shuffle = !this.modes.shuffle;
  };
  Playlist.prototype.loopSong = function () {
  	this.modes.loopSong = !this.modes.loopSong;
  };
  Playlist.prototype.loopPlaylist = function () {
    this.modes.loopPlaylist = !this.modes.loopPlaylist;
  };
  Playlist.prototype.tickAudioPosition = function () {
  	this.playlistView.tickAudioPosition.apply(this.playlistView, arguments);
  };

  Playlist.prototype.loadPlaylist = function () {
    var self = this;

    jQuery.get(this.config.endpoints.get.musicList, function(data, textStatus, xhr) {
      self.playlistView.buildView(data);
      self.playlistModel.buildModel(data);
    });    
  };

  global.Playlist = Playlist;

} ();