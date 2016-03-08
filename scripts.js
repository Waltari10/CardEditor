
/* global createjs */

$(window).resize(function() {  //Called on window resize
  
  $('canvas').attr('height', $(window).height() - 37).attr('width', $(window).width() - 232); //set to height minus top menu, width minus layers menu
   app.refreshlayers();

});

app = {
    stage: null,
    canvas: null,
    ctx: null,
    layers: [],
    
    getActiveLayer: function () { 
        var ret; 
        this.layers.forEach(function(v) { 
            if (v.active) ret = v; 
        }); 
        if ((ret === undefined) && (this.layers.length > 0)) return this.layers[0]; 
        return ret; 
    }, 
    
    refreshlayers: function () {
        console.log("refreshlayers");
        if ((this.getActiveLayer() === undefined) && (this.layers.length > 0)) this.layers[0].active = true;
        this.stage = new createjs.Stage(this.canvas);        //Set the EaselJS stage
        this.stage.regX = -this.canvas.width / 2;   //set the middle point of the stage
        this.stage.regY = -this.canvas.height / 2;  //--||--
        
        app.layers.toString = function () { //Save all layer information into JSON and return as String. Scale, rotation etc...
            console.log("this: " + this.length);
            var ret = []; 
            
            for (var i = 0, layer; layer = this[i]; i++) {   //How does this for loop work? What is "this"?
                ret.push('{"x":' + layer.x + ',"y":' + layer.y + ',"scaleX":' + layer.scaleX + ',"scaleY":' + layer.scaleY + ',"skewX":' + layer.skewX + ',"skewY":' + layer.skewY + ',"active":' + layer.active + ',"visible":' + layer.visible + ',"filters":{"names":[' + (layer.filters != null ? layer.filters.toString().replace(/(\[|\])/g, '"'): 'null') + '],"values":[' + JSON.stringify(layer.filters) + ']}}'); 
            } 
            return '[' + ret.join(',') + ']'; 
        };
        console.log(app.layers.toString());
        
        $('ul#layers').html(''); 
        for (var i = 0, layer; layer = this.layers[i]; i++) { 
            var self = this; 
            self.stage.addChild(layer); 
            (function(t, n) { 
                layer.onClick = function (e) { 
                    if ((self.tool != TOOL_TEXT) || (!t.text)) return true; 
                    self.activateLayer(t); 
                    editText = true; 
                } 

                layer.onPress = function (e1) { 
                    if (self.tool == TOOL_SELECT) { 
                        self.activateLayer(t); 
                    } 

                    var offset = { 
                        x: t.x - e1.stageX, 
                        y: t.y - e1.stageY 
                    } 

                    if (self.tool == TOOL_MOVE) self.addUndo(); 

                    e1.onMouseMove = function (e2) { 
                        if (self.tool == TOOL_MOVE) { 
                            t.x = offset.x + e2.stageX; 
                            t.y = offset.y + e2.stageY; 
                        } 
                    } 
                }; 
            })(layer, i); 
            layer.width = (layer.text != null ? layer.getMeasuredWidth() * layer.scaleX: layer.image.width * layer.scaleX); 
            layer.height = (layer.text != null ? layer.getMeasuredLineHeight() * layer.scaleY: layer.image.height * layer.scaleY); 
            layer.regX = layer.width / 2; 
            layer.regY = layer.height / 2; 
            $('ul#layers').prepend('<li id="layer-' + i + '" class="' + (layer.active ? 'active': '') + '"><img src="' + (layer.text != undefined ? '': layer.image.src) + '"/><h1>' + ((layer.name != null) && (layer.name != '') ? layer.name: 'Unnamed layer') + '</h1><span><button class="button-delete">Delete</button><button class="button-hide">' + (layer.visible ? 'Hide': 'Show') + '</button><button class="button-rename">Rename</button></span></li>'); 
        } 
        this.stage.update(); 
        $('ul#layers').sortable({ 
            stop: function () { 
                app.sortLayers(); 
            } 
        }); 
        
        //Disable, enable buttons
    }, 
  
    sortLayers: function () { 
        var tempLayers = [], 
            layersList = $('ul#layers li'); 

        for (var i = 0, layer; layer = $(layersList[i]); i++) { 
            if (layer.attr('id') == undefined) break; 
            tempLayers[i] = this.layers[layer.attr('id').replace('layer-', '') * 1]; 
        } 

        tempLayers.reverse(); 
        this.layers = tempLayers; 
        this.refreshLayers(); 
    }
};

function handleTick() {
    app.stage.update();
}

$(document).ready(function () {
   app.canvas = $('canvas')[0];  //Bind canvas to the first canvas element on the page
   ctx = app.canvas.getContext('2d');
   document.onselectstart = function () {return false;};
   createjs.Ticker.setFPS(30);
   createjs.Ticker.addEventListener("tick", handleTick);
   app.refreshlayers();
});
