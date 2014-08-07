

!function () {
  
  "use strict";

  var ajaxSender = function (props) {
    var xhr = new XMLHttpRequest();
 
    xhr.onload = function (e) {
       if (xhr.status === 200) {
          props.success && props.success(this.response);
       }
       else {
        props.error && props.error({ 'message' : "SSSS" });
       }
    };
     
    xhr.open(props.type, props.url, true);
    xhr.responseType = props.dataType;
    xhr.send();

  };

  var fileLoader = {};

  fileLoader.loadArrayBuffer = function (props) {
    props.dataType = "arraybuffer";
    ajaxSender(props);
  };

  fileLoader.ajaxSender = ajaxSender;

  global.fileLoader = fileLoader;

} ()