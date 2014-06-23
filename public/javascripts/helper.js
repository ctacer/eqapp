

!function () {
  
  "use strict";

  var helper = {};

  helper.str = {};

  helper.str.convertTimestampToMinuteSecond = function (timestamp) {
    var minutes = Math.round(Math.floor(timestamp / 60));
    var seconds = Math.round(timestamp - minutes * 60);

    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    return minutes + ":" + seconds;
  };

  global.helper = helper;

} ();