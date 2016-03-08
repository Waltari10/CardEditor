
/* global createjs */

app = {
    stage: null,
    canvas: null,
    layers: [],
    callbacks: {},
    selection: {
        x: -1, y: -1
    },
    renameLayer: 0,
    undoBuffer: [],
    redoBuffer: [],
    
    addUndo: function () { 
    this.undoBuffer.push(this.layers.toString()); 
    this.redoBuffer = []; 
    }, 

    loadLayers: function (from, to) { 
        var json, jsonString = from.pop(); 
        if (jsonString == undefined) return false; 
        to.push(this.layers.toString()); 
        json = JSON.parse(jsonString); 
        for (var i = 0, layer, jsonLayer; ((layer = this.layers[i]) && (jsonLayer = json[i])); i++) { 
            for (value in jsonLayer) { 
                if (value != 'filters') { 
                    layer[value] = jsonLayer[value]; 
                } else { 
                    var hadFilters = (layer.filters != null && layer.filters.length > 0); 
                    layer.filters = []; 
                    for (var j = 0; j < jsonLayer.filters.names.length; j++) { 
                        if (jsonLayer.filters.names[j] == null) break; 
                        layer.filters[j] = new window[jsonLayer.filters.names[j]]; 
                        for (value2 in jsonLayer.filters.values[0][j]) { 
                            layer.filters[j][value2] = jsonLayer.filters.values[0][j][value2]; 
                        } 
                        hadFilters = true; 
                    } 
                    if (hadFilters) { 
                        if (layer.cacheCanvas) { 
                            layer.updateCache(); 
                        } else { 
                            layer.cache(0, 0, layer.width, layer.height); 
                        } 
                    } 
                } 
            } 
        } 
        this.refreshLayers(); 
    }, 

    undo: function () { 
        this.loadLayers(this.undoBuffer, this.redoBuffer); 
    }, 

    redo: function () { 
        this.loadLayers(this.redoBuffer, this.undoBuffer); 
    },
    
    getActiveLayer: function () { 
        var ret; 
        this.layers.forEach(function(v) { 
            if (v.active) ret = v; 
        }); 
        if ((ret === undefined) && (this.layers.length > 0)) return this.layers[0]; 
        return ret; 
    }, 
    getActiveLayerN: function () { 
        for (var i = 0, layer; layer = this.layers[i]; i++) { 
            if (layer.active) return i; 
        } 
    }, 
    activateLayer: function (layer) { 
        this.layers.forEach(function (v) { 
            v.active = false; 
        }); 
        if (layer instanceof Bitmap) { 
            layer.active = true; 
        } else  { 
            if (this.layers[layer] == undefined) return; 
            this.layers[layer].active = true; 
        } 
        this.refreshLayers(); 
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
        $('ul#layers').sortable({ //Jquery UI. Make layers sortable.  Not necessary for us?
            stop: function () { 
                app.sortLayers(); 
            } 
        }); 
        
        //Disable, enable buttons depending on how many layers exist. Zero disable all buttons?
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
