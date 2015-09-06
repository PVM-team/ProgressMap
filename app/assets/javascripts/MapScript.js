

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.fillStyle = "#6B8E23"
ctx.fillRect(0,0,1000,1000);



var img = new Image(5,5);
img.src="ball2.png";

img.onload = function() {
    ctx.drawImage(img,250,250,70,70);
}
