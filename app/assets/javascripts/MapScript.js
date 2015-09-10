
window.onload = function() {
    var locations = document.getElementById("database");

    var div = document.createElement("div");
    //parentin täytyy olla relative jotta absolute position toimii lapsilla
    div.style.position="relative";
    document.body.appendChild(div);


    var canvas = document.createElement("canvas");
    div.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 1000;
    ctx.fillStyle = "#6B8E23";
    ctx.fillRect(0, 0, 1000, 1000);

    var button = createButton(div);
    placeButtonOnLocation(250, 600, button);
    var button2 = createButton(div);
    placeButtonOnLocation(500, 500, button2);
    var button3 = createButton(div);
    placeButtonOnLocation(800, 500, button3);
    var button4 = createButton(div);
    placeButtonOnLocation(700, 300, button4);

    drawQuadratic(250, 600, 500, 500);
    drawQuadratic(500, 500, 800, 500);
    drawQuadratic(800, 500, 700, 300);

    /*
    var img = new Image(5, 5);
    img.src = "ball2.png";
    */

    /*
     img.onload = function() {
     ctx.drawImage(img,250,600,70,70);
     ctx.drawImage(img,500,500,70,70);
     }
     */

    /*
    img.onload = function () {
         for (location in locations){
         placeImageOnLocation(location.x, location.y, img);
         }

         placeImageOnLocation(250, 600, img);
         placeImageOnLocation(500, 500, img);
         placeImageOnLocation(800, 500, img);
         placeImageOnLocation(700, 300, img);

    }
    */

    function createButton(parentDiv){
        var button = document.createElement("BUTTON");
        var buttonText = document.createTextNode("test");
        button.appendChild(buttonText);
        parentDiv.appendChild(button);

        return button;
    }

    function placeImageOnLocation(x, y, img) {
        ctx.drawImage(img, x, y, 70, 70);
    }

    function placeButtonOnLocation(x, y, button) {
        button.style.position="absolute";
        button.style.top = y + "px";
        button.style.left = x + "px";
    }

    function drawQuadratic(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo((x1), (y1));
        ctx.quadraticCurveTo(((x2 + x1) / 2), x2, (x2), (y2));
        ctx.stroke();
    }
}