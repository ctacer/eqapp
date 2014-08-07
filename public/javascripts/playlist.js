

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

  PlaylistModel.prototype.prevSong = function () {
    if (this.played.length > 1) {
      this.playing = this.played[this.played.length - 2];
      this.throwNextSong();
    }
  };

  PlaylistModel.prototype.nextSong = function () {
    var index;

    if (this.modes.loopSong) {
      
    }
    else if (this.modes.shuffle) {
      index = Math.floor(Math.random() * (this.playlist.length + 1));
      index = Math.min(index, this.playlist.length - 1);
      if (index < 0) {
        index = 0;
      }

      this.playing = this.playlist[index];      
    }
    else {
      index = 0;
      var playing = this.playing;

      this.playlist.forEach(function (song, i) {
        if (song.name === playing.name && song.path === playing.path) {
          index = i + 1;
        }
      });

      if (index >= this.playlist.length) {
        index = this.playlist.length - 1;
      }

      this.playing = this.playlist[index];
    }

    this.throwNextSong();
  };

  PlaylistModel.prototype.songStarted = function (model) {

    var getSong = function (arr) {
      var res = arr.filter(function (song) {
        return song.name === model.name && song.path === model.path;
      });

      return res.length ? res[0] : null;
    };

    var song = getSong(this.playlist);

    if (song) {
      this.played.push(song);
      this.playing = song;
    }
  };

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

      var container = jQuery(jQuery(this).parents('.playlist-item').get(0));
      while (container.length && !container.hasClass('active')) {
        container.addClass('active');
        container = container.parents('.playlist-item');
        if (!container.get(0)) {
          break;
        }
        container = jQuery(container.get(0));
      }

			self.throwSongEvent(jQuery(this));
		};
		jQuery('.playlist-trek').off('click').on('click', handler);
	};

  PlaylistView.prototype.setPauseEvents = function () {
    var self = this;

    var handler = function (event) {
      if (event.keyCode === 32) {
        self.controller('togglePlay');
        event.preventDefault && event.preventDefault();
        return false;
      }
    };
    jQuery('body').on('keydown', handler);

    jQuery('#player-play-pause-button').off('click').on('click', function () {
      handler.call(this, { 'keyCode' : '32' });
    });
  };

  PlaylistView.prototype.setPlaybackControllsEvent = function () {
    var self = this;

    jQuery('#player-playback-controlls .shuffle').off('click').on('click', function (event) {
      self.controller('shufflePlaylist', jQuery(this).hasClass('active'));
      jQuery(this).toggleClass('active');
    });

    jQuery('#player-playback-controlls .repeat').off('click').on('click', function (event) {
      self.controller('repeatPlaylist', jQuery(this).hasClass('active'));
      jQuery(this).toggleClass('active');
    });
  };

  PlaylistView.prototype.setPlaylistMoveEvent = function () {
    var self = this;

    jQuery('#player-pointer-controlls .prev-pointer').off('click').on('click', function (event) {
      self.controller('prevSong');
    });

    jQuery('#player-pointer-controlls .next-pointer').off('click').on('click', function (event) {
      self.controller('nextSong');
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

  PlaylistView.prototype.tickAudioPosition = function (props) {
    jQuery("#player-position-range").val(props.position);
    
    jQuery("#player-position-range-container>.left-time").text( global.helper.str.convertTimestampToMinuteSecond(props.left) );
    jQuery("#player-position-range-container>.last-time").text( global.helper.str.convertTimestampToMinuteSecond(props.last) );
  };

  PlaylistView.prototype.setPlayingState = function (props) {
    props = props || {};

    jQuery('#player-play-pause-button').removeClass("playing stoped paused");

    if (props.playing) {
      jQuery('#player-play-pause-button').addClass("playing");
    }
    else if (props.stoped) {
      jQuery('#player-play-pause-button').addClass("stoped");
    }
    else if (props.paused) {
      jQuery('#player-play-pause-button').addClass("paused");
    }
  };

	PlaylistView.prototype.setPlaylistEvents = function () {
		this.setFolderExpandingEvents();
		this.setSongChooseEvents();
    this.setPauseEvents();
    this.setPlaybackControllsEvent();
    this.setPlaylistMoveEvent();
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
    var container = template.find('.playlist-item-body');
    playlist.folders.forEach(function (folder) {
      self.buildPlaylist(folder, container);
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
  	this.playlistModel.modes.shuffle = !this.playlistModel.modes.shuffle;
  };
  Playlist.prototype.repeat = function () {
  	this.playlistModel.modes.loopSong = !this.playlistModel.modes.loopSong;
  };
  Playlist.prototype.loopPlaylist = function () {
    this.playlistModel.modes.loopPlaylist = !this.playlistModel.modes.loopPlaylist;
  };
  Playlist.prototype.tickAudioPosition = function () {
    this.playlistView.tickAudioPosition.apply(this.playlistView, arguments);
  };
  Playlist.prototype.setPlayingState = function () {
  	this.playlistView.setPlayingState.apply(this.playlistView, arguments);
  };

  Playlist.prototype.loadPlaylist = function () {
    var self = this;

    jQuery.get(this.config.endpoints.get.musicList, function(data, textStatus, xhr) {
      self.playlistView.buildView(data);
      self.playlistModel.buildModel(data);
    });    
  };

  Playlist.prototype.nextSong = function () {
    this.playlistModel.nextSong();
  };

  Playlist.prototype.prevSong = function () {
    this.playlistModel.prevSong();
  };

  Playlist.prototype.songStarted = function (model) {
    this.playlistModel.songStarted(model);
  };

  global.Playlist = Playlist;

} ();