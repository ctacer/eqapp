

<<<<<<< HEAD
function Player (cnv){
  this.ROOT = "/resources/music/";
  this.sources = [];
  this.audioSources = {};
  this.currBuffer = null;
  this.TimeElem = null;
  this.color = '#000088';
  this.canvas = cnv || null;

  this.createTrekList = function(el,self){
=======
!function () {
>>>>>>> origin/refactore_branch

  "use strict";

  function Player (props) {

    this.setControllers();
    this.view = new global.PlayerView(props);
    props.controller = this.controller.bind(this);
    this.model = new global.PlayerModel(props);


<<<<<<< HEAD
      },false);
      corediv.appendChild(tittlediv);

      var contentdiv = document.createElement('div');
      if( i != 0 )
        contentdiv.className = "ContentSubFolder";
      corediv.appendChild(contentdiv);

      for (var j = 0; j < self.folders[i].folderSources.length; j++) {
        //self.folders[i].folderSources[j]

        var elementdiv = document.createElement('div');
        elementdiv.className = "ContentSubFolderElement";

        elementdiv.addEventListener('click',function(e){

          //self.curEl.style.borderColor = "white";
          self.curEl = (e.target);
          //self.curEl.style.borderColor = "lightblue";

          self.SetAudioContext(self,e.target.parentNode.previousSibling.innerHTML + "/" + e.target.innerHTML);
          self.BindAudioToElem(self.TimeElem);

        },false);
        elementdiv.innerHTML = self.folders[i].folderSources[j];
        contentdiv.appendChild(elementdiv);
        if(i == 0 && j == 0){
          self.curEl = elementdiv;//document.getElementById("TrekList").children[0];
          //self.curEl.style.border = "1px lightblue solid";
        }

      };

      el.appendChild(corediv);


    }
  }

=======
    this.play = function () {};
    this.stop = function () {};
    this.pause = function () {};
    
    this.volume = function () {};
    this.rewind = function () {};
>>>>>>> origin/refactore_branch

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

    'nextSong' : function () {
      this.model.nextSong();
    },

    'prevSong' : function () {
      this.model.prevSong();
    },

    'shufflePlaylist' : function (activate) {
      this.model.playlist.shuffle(activate);
    },

    'repeatPlaylist' : function (activate) {
      this.model.playlist.repeat(activate);
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
    },

    'setPosition' : function (position) {
      this.model.setPosition(position);
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
