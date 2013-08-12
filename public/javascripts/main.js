
var audio ,audio0 ,Player ,
	context  ,
	analyser ,
	canvas ,canvas2 ,ctx ,ctx2 ,
	CANVAS_HEIGHT ,CANVAS_WIDTH ,source ,
	color = 'lightblue' ,resultoflistrequest ,Renderin = false ;


function loader(e){

	window.addEventListener( 'resize', onWindowResize, false );

	prepare();

	CANVAS_HEIGHT = canvas.height;
	CANVAS_WIDTH = canvas.width;
	
	
	//document.querySelector('#myaudio').appendChild(audio);

	//audio.addEventListener('loadeddata',function(){	
/*
		context = new webkitAudioContext();
		analyser = context.createAnalyser();	

		source = context.createMediaElementSource(audio);
		source.connect(analyser);
		analyser.connect(context.destination);

		console.log('loaded');
*//*
		document.getElementById('play').addEventListener('click', function(e) {
  
			if (Player.audioContext.audio.paused) {			    
			  Player.audioContext.audio.play();
			} else {    
			  Player.audioContext.audio.pause();
			}

		}, false);		

		if(!Renderin){
			render();
			Renderin = !Renderin;
		}
*/

	//},false);	

	
	

}

function prepare(){

	canvas = document.getElementById('fft');
	ctx = canvas.getContext('2d');
	//canvas.width = document.body.clientWidth;
	//canvas.height = document.body.clientHeight/2;
/*
	audio = new Audio();
	audio.src = 'http://www.html5rocks.com/en/tutorials/audio/quick/test.ogg';
	//audio.src = 'resources/music/Insertion.mp3';	
	audio.controls = true;
	audio.autoplay = true;
	audio.loop = true;
*/	
	loadXMLDoc();
/*
	var currenTimeNode = document.querySelector('#current-time');
	Player.audioContext.audio.addEventListener('timeupdate', function(e) {
	  var currTime = Player.audioContext.audio.currentTime;
	  currenTimeNode.textContent = parseInt(currTime / 60) + ':' + parseInt(currTime % 60);
	}, false);*/

}

function render(){

	window.webkitRequestAnimationFrame(render,canvas);

	var freqByteData = new Uint8Array(Player.analyser.frequencyBinCount);
	Player.analyser.getByteFrequencyData(freqByteData); //analyser.getByteTimeDomainData(freqByteData);	

	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	ctx.fillStyle = color;	
	ctx.lineCap = 'round';

	var SPACER_WIDTH = 2;
	var numBars = Math.round(CANVAS_WIDTH / SPACER_WIDTH);	
	var BAR_WIDTH = 1;
	var OFFSET = 2;	
	//console.log(freqByteData[200]);
	
	for (var i = 0; i < numBars; ++i) {
	  var magnitude = freqByteData[i*OFFSET];
	  ctx.fillRect(i * SPACER_WIDTH, CANVAS_HEIGHT, BAR_WIDTH, -magnitude);	  
	}
}

function onWindowResize(e){

	canvas.width = document.body.clientWidth;
	canvas.height = (document.body.clientHeight/2.5 > 400)?document.body.clientHeight/2.5:400;
	CANVAS_HEIGHT = canvas.height;
	CANVAS_WIDTH = canvas.width;

}


function loadXMLDoc(){

	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.onreadystatechange=function()
	  {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	    {
	    	var ar = xmlhttp.responseText;
	    	Player = new Player(ar);
	    	Player.createTrekList(document.getElementById('TrekList'));
			var currenTimeNode = document.querySelector('#current-time');
			Player.audioContext.audio.addEventListener('timeupdate', function(e) {
				var currTime = Player.audioContext.audio.currentTime;
				currenTimeNode.textContent = parseInt(currTime / 60) + ':' + parseInt(currTime % 60);
			}, false);

			document.getElementById('play').addEventListener('click', function(e) {
  
			if (Player.audioContext.audio.paused) {			    
			  Player.audioContext.audio.play();
			} else {    
			  Player.audioContext.audio.pause();
			}

			}, false);		

			if(!Renderin){
				render();
				Renderin = !Renderin;
			}

	    }
	  }
	xmlhttp.open("GET","server.php?fval=mp3",true);
	xmlhttp.send();

}



window.onload = loader;
