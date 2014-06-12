

!function () {

  "use strict";

  var playerUI = {
    'color' : '#000088',
    'canvas' : null
  };


  function PlayerModel (props) {

    this.playlist = new global.Playlist(props);

  }

  PlayerModel.prototype.chooseSong = function (songModel) {
    //
  };

  function Equalizer (props) {

  }

  function PlayerView (props) {

    this.equalizer = new Equalizer(props);
    
    this.render = function () {};

  }


  function Player (props) {

    this.setControllers();
    this.view = new PlayerView(props);
    props.controller = this.controller.bind(this);
    this.model = new PlayerModel(props);


    this.play = function () {};
    this.stop = function () {};
    this.pause = function () {};
    
    this.volume = function () {};
    this.rewind = function () {};

    this.next = function () {};
    this.prev = function () {};


  }

  Player.prototype.controllers = {
    'chooseSong' : function (songModel) {
      this.model.chooseSong(songModel);
    },

    'startSong' : function (songModel) {
      console.log(songModel);
    }
  };


  Player.prototype.setControllers = function () {    
    this.controller = function (type) {
      if (this.controllers.hasOwnProperty(type)) {
        this.controllers[type].apply(this, Array.prototype.slice.call(arguments, 1)); 
      }
    };
  };

  global.Player = Player;

} ();