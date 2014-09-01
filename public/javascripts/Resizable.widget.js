

!function () {

  /**
   * class for making resizable functionality
   */
  var ResizeHandler = function (element) {
    this.mouseIsDown = false;
    this.element = element;
  };

  ResizeHandler.prototype.mouseUp = function () {
    this.mouseIsDown = false;
  };

  ResizeHandler.prototype.mouseDown = function () {
    this.mouseIsDown = true;
  };

  ResizeHandler.prototype.mouseMove = function (event) {
    if (!this.mouseIsDown) return;

    this.element.css('height', 100 * (window.innerHeight - event.clientY - 15) / window.innerHeight + "%");
  };

  ResizeHandler.prototype.on = function (method) {
    return method in this ? this[method].bind(this) : function () { console.log('Do not have ' + method); };
  };

  /**
   * function validates arguments and returns extracted data
   */
  var extractArguments = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var element = this;
    var expandButton;

    if (args.length == 0 || typeof args[0] != 'object') {
      return { element: element, expandButton: null };
    }

    if (args[0].hasOwnProperty('expandButton')) {
      expandButton = args[0].expandButton;
    }
    else {
      expandButton = args[0];
    }

    return { element: element, expandButton: expandButton };
  };
  
  /**
   * function will be set to jQuery prototype - makes element resizable
   */
  var resizable = function () {
    with (extractArguments.apply(this, Array.prototype.slice.call(arguments, 0))) {
      var handler = new ResizeHandler(element);
      element;

      expandButton
        .off('mousedown').on('mousedown', handler.on('mouseDown'))
        .off('mouseup').on('mouseup', handler.on('mouseUp'));

      jQuery('body')
        .off('mousemove').on('mousemove', handler.on('mouseMove'))
        .off('mouseup').on('mouseup', handler.on('mouseUp'));

      jQuery(window)
        .off('mouseup').on('mouseup', handler.on('mouseUp'));
    }
  };

  var toExtend = {
    resizable: resizable
  };

  jQuery.fn.extend(toExtend);

} ();