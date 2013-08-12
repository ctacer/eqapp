
var Player ,canvas;

function loader(e){

	window.addEventListener( 'resize', onWindowResize, false );

	canvas = document.getElementById('fft');

	Player = new Player(canvas);
	
	Player.LoadList(document.getElementById('TrekList'));		
	Player.SetPlayPauseEvents();
	Player.BindAudioToElem(document.getElementById('currentTime'));
	document.getElementById("timeRange").addEventListener('input',function(event){
		Player.rewind(event.target.value/(event.target.max || 100));
	},false);
	/*document.getElementById("VolumeRange").addEventListener('input',function(event){
		Player.ChangeVolume( event.target.value/100 );
	},false);*/

	document.getElementById('TrekList').addEventListener("dragover",handelDragOver,false);
	document.getElementById('TrekList').addEventListener("drop",handleFileDrop,false);

}


function onWindowResize(e){

	canvas.width = document.body.clientWidth;
	canvas.height = (document.body.clientHeight/2.5 > 400)?document.body.clientHeight/2.5:400;
	CANVAS_HEIGHT = canvas.height;
	CANVAS_WIDTH = canvas.width;

}

function handelDragOver(event){
	event.stopPropagation();
	event.preventDefault();
}

function handleFileDrop(event){
	event.stopPropagation();
	event.preventDefault();

	var file = event.dataTransfer.files[0],
	reader = new FileReader();
	console.log(event.dataTransfer);

	reader.onload = function (event) {
		console.log(event.target);
		console.log( event.target.result );
		//holder.style.background = 'url(' + event.target.result + ') no-repeat center';
	};
	console.log(file);
	//reader.readAsDataURL(file);
/*
	if( (/(\.mp3)$/g).test(escape(f.name) ) ){
	    reader.onloadend = function(evt) {
		    if (evt.target.readyState == FileReader.DONE) {
				//action
			}
		}
		var blob = f.slice(0, f.size);
		reader.readAsBinaryString(blob);
	}
*/

	console.log(event);
}


window.onload = loader;
