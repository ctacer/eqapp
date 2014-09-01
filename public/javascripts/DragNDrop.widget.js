

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

  DragAndDropHandler.prototype.dragOver = function (event) {
    console.log(event);
    this.element.addClass(config.classes.over);
  };

  DragAndDropHandler.prototype.dragLeave = function (event) {
    console.log(event);    
    this.element.removeClass(config.classes.over);
  };



  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  var droppable = function (props) {
    props = props || {};
    var dropHandler = new DragAndDropHandler({ element: this });

    this.off('dragover').on('dragover', dropHandler.on('dragOver'));
    this.off('dragleave').on('dragleave', dropHandler.on('dragLeave'));
  };

  jQuery.fn.extend({
    droppable: droppable
  });

} ();