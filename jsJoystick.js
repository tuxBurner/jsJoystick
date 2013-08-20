/**
* Tiny jqueryPlugin which makes a div turn into a nice little joystick
*/
(function ($) {
 
    $.fn.jsJoystick = function( options ) {
 
        // This is the easiest way to have default options.
        var settings = $.extend({
            debug: false,
            dragMode: "normal",
            intervalTimer: 1/30 * 1000,
            callBackFunc: undefined
        }, options);

        if(options.callBackFunc == undefined) {
          alert("You must set the callBackFunc in the options !");
          return;
        }

        var that = this;

        var width = null;
        var height = null;
        var canvasCenterX = null;
        var canvasCenterY = null;
        var xBoundingBoxMax = null;
        var yBoundingBoxMax = null;
        // one percent from the center of the canvas
        var canvasXOnePercent = null;
        var canvasYOnePercent = null;
        var initialized = false;

        var dragHandleRadius = 40;

        var canvasId = 'jsJoystickCanvas';

        var checkAndSetValues = function() {

          if(initialized == false || width != that.width() ||  height != that.height()) {

            width = that.width();
            height = that.height();
            canvasCenterX = width / 2;
            canvasCenterY = height / 2;

            // one percent from the center of the canvas
            canvasXOnePercent = (canvasCenterX - dragHandleRadius) / 100;
            canvasYOnePercent = (canvasCenterY - dragHandleRadius) / 100;
            xBoundingBoxMax = width - dragHandleRadius;
            yBoundingBoxMax = height - dragHandleRadius;

            // we have to resize the kinetic stuff to  
            if(initialized == true) {
              stage.setWidth(width);
              stage.setHeight(height);
              startPoint.setPosition(canvasCenterX,canvasCenterY);
              dragHandle.setPosition(canvasCenterX,canvasCenterY);
              stage.draw();      
            }
          }
        }

        checkAndSetValues();
        initialized = true;
        


        // the kinetic stage
         var stage = new Kinetic.Stage({
           // TODO: can we use the jquery element here ?	
           container: this.attr('id'),
           width: width,
           height: height
         }); 

        // layer to draw on 
        var layer = new Kinetic.Layer();
         
        // we need somethin like a joystick thingi to drag around
        var startPoint = new Kinetic.Circle({
          x: canvasCenterX,
          y: canvasCenterY,
          radius: dragHandleRadius+5,
          //fill: 'red',
          stroke: 'red',
          strokeWidth: 5
        });

      // add the shape to the layer
      layer.add(startPoint);

      var dragHandle = new Kinetic.Circle({
      	  x: canvasCenterX,
          y: canvasCenterY,
          radius: dragHandleRadius,
          fill: 'blue',
          stroke: 'black',
          strokeWidth: 1,
          opacity: 0.9,
          draggable: true,
          dragBoundFunc: function(pos) {
             
            if(options.dragMode == "vertical") {
              pos.x = this.getAbsolutePosition().x;  
            } else {
              if(pos.x < dragHandleRadius) pos.x = dragHandleRadius;
              else if(pos.x > xBoundingBoxMax) pos.x = xBoundingBoxMax;              
            }  

            if(options.dragMode == "horizontal") {
              pos.y = this.getAbsolutePosition().y;               
            } else {
              if(pos.y < dragHandleRadius) pos.y = dragHandleRadius;
              else if(pos.y > yBoundingBoxMax) pos.y = yBoundingBoxMax;
            }  

            return {
                y: pos.y,
                x: pos.x
            }
          }
      });

      // add cursor styling
      dragHandle.on('mouseover', function() {
        document.body.style.cursor = 'pointer';
      });
      dragHandle.on('mouseout', function() {
        document.body.style.cursor = 'default';
      });

      dragHandle.on('dragend', function() {
        // position the handle back to the center
        dragHandle.setPosition(canvasCenterX,canvasCenterY);
        stage.draw();
      });

      layer.add(dragHandle);

      // add the layer to the stage
      stage.add(layer);

      // start polling the x and y delta from the joystick and put the data into the callback function
      setInterval(function(){

        checkAndSetValues(); 

        var dragHandlePos = dragHandle.getPosition();

        // calc the delta from the center
        var xDelta = canvasCenterX - dragHandlePos.x;
        var yDelta = canvasCenterY - dragHandlePos.y;

        var xDeltaPercent = 0;
        if(canvasCenterX > dragHandlePos.x) {
          xDeltaPercent = (canvasCenterX - dragHandlePos.x) / canvasXOnePercent;
        }   
        if(canvasCenterX < dragHandlePos.x) {
          xDeltaPercent = (dragHandlePos.x - canvasCenterX) / canvasXOnePercent * -1;
        }

        var yDeltaPercent = 0;
        if(canvasCenterY > dragHandlePos.y) {
          yDeltaPercent = (canvasCenterY - dragHandlePos.y) / canvasYOnePercent;
        }   
        if(canvasCenterY < dragHandlePos.y) {
          yDeltaPercent = (dragHandlePos.y - canvasCenterY) / canvasYOnePercent * -1;
        }

        options.callBackFunc({deltaX:  xDelta, deltaY :  yDelta, deltaXPercent: xDeltaPercent, deltaYPercent: yDeltaPercent}); 
        

      }, options.intervalTimer);
    };
 
}( jQuery ));