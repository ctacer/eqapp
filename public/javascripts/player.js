

!function () {

  "use strict";

  function Player (props) {

    this.setControllers();
    this.view = new global.PlayerView(props);
    props.controller = this.controller.bind(this);
    this.model = new global.PlayerModel(props);


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
    },

    'setAnalyser' : function (analyser) {
      this.view.analyser = analyser;
      this.view.render();
    },

    'freeAnalyzer' : function (analyser) {
      this.view.analyser = null;
    },

    'togglePlay' : function () {      
      this.model.togglePlay();
    },

    'setVolume' : function (volume) {
      this.model.setVolume(volume);
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