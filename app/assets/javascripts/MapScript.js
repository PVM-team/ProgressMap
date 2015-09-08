
window.onload = function() {
    var locations = document.getElementById("database");

    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#6B8E23";
    ctx.fillRect(0, 0, 1000, 1000);


    var img = new Image(5, 5);
    img.src = "ball2.png";

    /*
     img.onload = function() {
     ctx.drawImage(img,250,600,70,70);
     ctx.drawImage(img,500,500,70,70);
     }
     */

    img.onload = function () {
        /* for (location in locations){
         placeImageOnLocation(location.x, location.y, img);
         }*/
        /*
         placeImageOnLocation(250, 600, img);
         placeImageOnLocation(500, 500, img);
         placeImageOnLocation(800, 500, img);
         placeImageOnLocation(700, 300, img);
         */
    }

    drawQuadratic(250, 600, 500, 500);
    drawQuadratic(500, 500, 800, 500);
    drawQuadratic(800, 500, 700, 300);


    function placeImageOnLocation(x, y, img) {
        ctx.drawImage(img, x, y, 70, 70);
    }

    function drawQuadratic(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo((x1 + 40), (y1 + 40));
        ctx.quadraticCurveTo(((x2 + x1) / 2), x2, (x2 + 40), (y2 + 40));
        ctx.stroke();
    }
}