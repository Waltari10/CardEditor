
var ctx, canvas;

function init() {
	var imageLoader = document.getElementById('imageLoader');
		 imageLoader.addEventListener('change', handleImage, false);

	canvas = document.getElementById('appCanvas');
	ctx = canvas.getContext('2d');
}
/* important! for alignment, you should make things
 * relative to the canvas' current width/height.
 */
function draw() {
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	//...drawing code...
	drawRectangle();
}

function drawRectangle() {
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(0,0,150,75);
}

function handleImage(e) {
	var reader = new FileReader();
	reader.onload = function(event) {
		var img = new Image();
		img.onload = function() {
			ctx.drawImage(img, 0,0);
		}
		img.src= event.target.result;
	}
	reader.readAsDataURL(e.target.files[0])
;
}