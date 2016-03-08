/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


importFile = false; //The importFile variable will inform us of whether we are opening a file or importing it
  
hideDialog = function (dialog) { 
    $(dialog).hide(); 
    if ($('.dialog:visible').length === 0) $('#overlay').hide(); 
    editText = false; 
};
  
showDialog = function (dialog) { 
    $('#overlay').show(); 
    $(dialog).show(); 
};

$(window).resize(function() {  //Called on window resize
  $('.dialog').each(function () {   //Center all dialogs (pop up windows)
        $(this).css({ left: window.innerWidth / 2 - $(this).outerWidth() / 2 + 'px', top: window.innerHeight / 2 - $(this).outerHeight() / 2 + 'px' }); 
    }); 
  
  
  $('canvas').attr('height', $(window).height() - 37).attr('width', $(window).width() - 232); 
    $('ul#mainmenu').width($(window).width() - 4); 
   // $('ul#layers').css({ height: $(window).height() - 37 }); 
   app.refreshlayers();

   /* if ($('#cropoverlay').css('display') == 'block') { 
        $('#cropoverlay').css({  
            left: Math.ceil(app.canvas.width / 2 - app.getActiveLayer().x - app.getActiveLayer().regX - 1) + 'px',  
            top: Math.ceil(app.canvas.height / 2 + app.getActiveLayer().y - app.getActiveLayer().regY + 38) + 'px'
        }); 
    } */

});