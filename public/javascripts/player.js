

function Player (cnv){
  this.ROOT = "/resources/music/";
  this.sources = [];
  this.audioSources = {};
  this.currBuffer = null;
  this.TimeElem = null;
  this.color = '#000088';
  this.canvas = cnv || null;
  
  this.createTrekList = function(el,self){

    for (var i = 0; i < self.folders.length; i++) {

      var corediv = document.createElement('div');
      corediv.className = "SubFolder";

      var tittlediv = document.createElement('div');
      tittlediv.className = "TittleSubFolder";
      tittlediv.setAttribute("data-attr", i);
      tittlediv.innerHTML = self.folders[i].folderName;
      tittlediv.addEventListener('click',function(e){

        //open/close folder content
        console.log(e.target);
        var attr = parseInt(e.target.getAttribute("data-attr") );
        if( self.folders[attr].state == "hidden"){
          self.folders[attr].state = "shown";
          var el = e.target.nextSibling;
          el.style.display = "block";
          console.log(el);
        }
        else if(self.folders[attr].state == "shown"){
          self.folders[attr].state = "hidden";
          var el = e.target.nextSibling;
          el.style.display = "none";
          console.log(el);
        }

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

          self.curEl.style.borderColor = "white";
          self.curEl = (e.target);
          self.curEl.style.borderColor = "lightblue";

          self.SetAudioContext(self,e.target.parentNode.previousSibling.innerHTML + "/" + e.target.innerHTML);
          self.BindAudioToElem(self.TimeElem);

        },false);
        elementdiv.innerHTML = self.folders[i].folderSources[j];
        contentdiv.appendChild(elementdiv);
        if(i == 0 && j == 0){
          self.curEl = elementdiv;//document.getElementById("TrekList").children[0];
          self.curEl.style.border = "1px lightblue solid";
        }

      };

      el.appendChild(corediv);


    }

    /*for (var i = 0; i < self.sources.length; i++) {
    
      var div = document.createElement('div');
      div.className = "TrekListElement";
      var self = this;
      div.addEventListener('click',function(e){

        self.curEl.style.borderColor = "white";
        self.curEl = (e.target);
        self.curEl.style.borderColor = "lightblue";

        self.SetAudioContext(self,e.target.innerHTML);
        self.BindAudioToElem(self.TimeElem);

      },false);
      div.innerHTML = this.sources[i];
      el.appendChild(div);

      if(i == 0){
        self.curEl = div;//document.getElementById("TrekList").children[0];
        self.curEl.style.border = "1px lightblue solid";
      }


    }  */
    
  }


  this.LoadList = function(el){
    var xmlhttp = new XMLHttpRequest();
    var self = this;
    xmlhttp.onreadystatechange=function()
      {
      if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
          var ar = JSON.parse(xmlhttp.response);
          console.log(ar);

          self.folders = [];
          var arr = ar.folders;
          for (var i = 0; i < arr.length; i++) {
            var obj = {state:"hidden"};
            obj.content = arr[i];
            obj.folderName = arr[i].folderName;
            if( arr[i].files )
              obj.folderSources = arr[i].files;
            else
              obj.folderSources = [];
            console.log(obj);
            self.folders.push(obj);
          };

          self.SetAudioContext(self,'/' + self.folders[0].folderName + '/' + self.folders[0].folderSources[0]);
          self.createTrekList(el,self);
        }

      }
      xmlhttp.open("GET","/music?fval=mp3",true);
      xmlhttp.send();
  }
  this.BindCanvas = function(cnv){
    this.canvas = cnv;
  }

  this.Visualise = function (){

    if(!this.VISUALIZER){
      this.VISUALIZER = !this.VISUALIZER;
      var self = this,
      ctx = this.canvas.getContext('2d');

      window.webkitRequestAnimationFrame(function bla(){
          window.webkitRequestAnimationFrame(bla); 
          
          var freqByteData = new Uint8Array(self.analyser.frequencyBinCount);
          self.analyser.getByteFrequencyData(freqByteData); //analyser.getByteTimeDomainData(freqByteData);  

          ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
          ctx.fillStyle = '#8A3333';  
          ctx.lineCap = 'round';
          
          var SPACER_WIDTH = 4;
          var numBars = Math.round(self.canvas.width / SPACER_WIDTH);  
          var BAR_WIDTH = 2;
          var OFFSET = 4; 
          var CANVAS_HEIGHT = self.canvas.height;
          
          
          for (var i = 0; i < numBars; ++i) {
            var magnitude = freqByteData[i*OFFSET];
            ctx.fillRect(i * SPACER_WIDTH, CANVAS_HEIGHT, BAR_WIDTH, -magnitude);   
          }
      });
    }
    
  }

  this.BindAudioToElem = function(el){
    var self = this;
    if(!el)return;

    self.TimeElem = el;
    document.getElementById("timeRange").value = "0";
    if(self.audioContext.duration)
      document.getElementById("duration").innerHTML = parseInt(self.audioContext.duration / 60) + ':' + parseInt(self.audioContext.duration % 60);
    this.audioContext.addEventListener('timeupdate', function(e) {
      var currTime = self.audioContext.currentTime;      
      document.getElementById("timeRange").value = Math.floor(currTime*100/self.audioContext.duration);
      self.TimeElem.textContent = parseInt(currTime / 60) + ':' + parseInt(currTime % 60);
    }, false);


  }

  this.SetPlayPauseEvents = function(el){
    var self = this;
    if(el)
      el.addEventListener('click', function(e) {
  
        self.TooglePlay();

      }, false);
    window.addEventListener('keydown',function(e){
      if(e.keyCode == 32){ //space

        self.TooglePlay();
      }

    },false);
  }

  this.ChangeVolume = function( value ){
    this.audioContext.volume = value;
    console.log(this.audioContext.volume);
    //this.gainNode.gain.value = -1 + 2*value;
  }

  this.rewind = function(val){
    console.log(val*this.audioContext.duration);
    this.audioContext.currentTime = val*this.audioContext.duration;
  }

  this.TooglePlay = function(){
    this._plaing?this.audioContext.play():this.audioContext.pause();
    this._plaing = !this._plaing;
  }

  this.DisconnectPrev = function( ){
    if(this.source)
      this.source.disconnect(0); 
    if(this.analyser)
      this.analyser.disconnect(0);
  }

  this.SetAnalyzer = function(){
    if(!this.analyser)this.analyser = this.context.createAnalyser();

    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  }

  this.SetGainNode = function(){
    if(!this.gainNode)this.gainNode = this.context.createGain();

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
  }

  this.SetAudioContext = function(self,src){
      console.log( "/resources/music/"+src.replace(/&amp;/g, '&') );

    self.DisconnectPrev();

    if(!self.audioSources[src]){
      self.audioContext = SetAudio();
      self.audioContext.src = "/resources/music/"+src.replace(/&amp;/g, '&');;
    
      self.audioContext.addEventListener('loadeddata',function(){
        console.log('loadedaudio');
        self.audioSources[src] = self.context.createMediaElementSource(self.audioContext);
        self.source = self.audioSources[src];

        //self.SetGainNode();
        self.SetAnalyzer();

        self.BindAudioToElem(self.TimeElem);
        self.Visualise();

      },false);
    }
    else{
      self.audioContext = self.audioSources[src].mediaElement;
      self.audioContext.currentTime = 0;
      
      console.log('reloadedaudio');
      self.source = self.audioSources[src];

      //self.SetGainNode();
      self.SetAnalyzer();

      self.BindAudioToElem(self.TimeElem);
      self.Visualise();
    }
  }

  this.audioContext = SetAudio();
  this.context = new webkitAudioContext();
  console.log(this.context);
  this.analyser = this.context.createAnalyser(); 

}

function SetAudio(){

  var audio = new Audio(); 
  audio.controls = true;
  audio.autoplay = true;
  audio.loop = true;
  
  return audio;
}
