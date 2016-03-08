
$(window).resize(function() {  //Called on window resize
  
  $('canvas').attr('height', $(window).height() - 37).attr('width', $(window).width() - 232); //set to height minus top menu, width minus layers menu

  app.draw(); //Redraw  rectangle
});

app = {
    stage: null,
    canvas: null,
    ctx: null,
    
    init: function () {
        app.stage = new createjs.Stage("canvasElementId");
        var imageLoader = document.getElementById('imageLoader');
         imageLoader.addEventListener('change', app.handleImage, false);

        canvas = document.getElementById('appCanvas');
        ctx = canvas.getContext('2d');
    },

    draw: function () {
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        //...drawing code...
        app.drawRectangle();
    },

    drawRectangle: function() {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0,0,150,75);
    },

    handleImage: function(e) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.onload = function() {
                    ctx.drawImage(img, 0,0);
            }
            img.src= event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }
}

function handleTick() {
    app.stage.update();
}

$(document).ready(function () {
   app.canvas = $('canvas')[0];
   document.onselectstart = function () {return false;};
   createjs.Ticker.setFPS(30);
   createjs.Ticker.addEventListener("tick", handleTick);
});