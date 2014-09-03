

!function () {

  var config = {
    classes: {
      widget: 'drag-n-drop',
      drag: 'drag',
      drop: 'drop',
      over: 'over'
    }
  };
  
  var DragAndDropHandler = function (props) {
    this.element = props.element;

    this.element.addClass(config.classes.widget);
    this.element.addClass(config.classes.drag);
    this.element.addClass(config.classes.drop);
  };

  DragAndDropHandler.prototype.on = function (method) {
    return method in this ? this[method].bind(this) : function () { console.log('Do not have ' + method); };
  };

  DragAndDropHandler.prototype.preventDefault = function (event) {
    event.stopPropagation && event.stopPropagation();
    event.preventDefault && event.preventDefault();
    return false;
  };

  DragAndDropHandler.prototype.dragOver = function (event) {
    this.element.addClass(config.classes.over);

    var e = event.originalEvent;
    var files = e.dataTransfer.files;
    for (var i = 0, f; f = files[i]; i++) {
      console.log(f, f.name);
    }
    console.log(e);

    return this.preventDefault(event);
  };

  DragAndDropHandler.prototype.dragEnter = function (event) {
    // this.element.addClass(config.classes.over);

    var e = event.originalEvent;
    var files = e.dataTransfer.files;
    for (var i = 0, f; f = files[i]; i++) {
      console.log(f, f.name);
    }
    console.log(e);

    return this.preventDefault(event);
  };

  DragAndDropHandler.prototype.dragLeave = function (event) {
    this.element.removeClass(config.classes.over);
    return this.preventDefault(event);
  };

  DragAndDropHandler.prototype.drop = function (event) {
    var e = event.originalEvent;
    var files = e.dataTransfer.files;
    for (var i = 0, f; f = files[i]; i++) {
      console.log(f, f.name);
    }
    console.log(e);

    this.element.removeClass(config.classes.over);
    return this.preventDefault(event);
  };

  DragAndDropHandler.prototype.drag = function (event) {
    return this.preventDefault(event);
  };

  DragAndDropHandler.prototype.dragend = function (event) {
    return this.preventDefault(event);
  };



  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  var droppable = function (props) {
    props = props || {};
    var dropHandler = new DragAndDropHandler({ element: this });

    this.off('dragover').on('dragover', dropHandler.on('dragOver'));
    this.off('dragleave').on('dragleave', dropHandler.on('dragLeave'));
    this.off('drop').on('drop', dropHandler.on('drop'));
    this.off('drag').on('drag', dropHandler.on('drag'));
    this.off('dragend').on('dragend', dropHandler.on('dragend'));
    this.off('dragenter').on('dragenter', dropHandler.on('dragEnter'));
  };

  jQuery.fn.extend({
    droppable: droppable
  });

} ();