ProgressApp.service('CanvasService', function () {

    var canvas;
    var context;

    var smoothConfig = {
        method: 'lanczos',
        clip: 'zero',
        lanczosFilterSize: 10,
        cubicTension: 0
    };

    function placeCanvasInDiv(div) {
        if (div) {
            div.appendChild(canvas);
        }
    };

    function setContext(){
        context = canvas.getContext("2d");
    }

    function setCanvasBGColor(bgColor, height, width) {
        context.fillStyle = bgColor;
        context.fillRect(0, 0, height, width);
    };

    function distance(a, b){
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    function drawSmoothCurve(i, locations) {
        var ref, ref2, start, end, pieceLength, wat;
        
        var s = Smooth(locations, smoothConfig);
        var averageLineLength = 1;
        var pieceCount = 2;
        var ref = 1 / pieceCount;
        
        for (var j = 0; j < 1; j += ref) {
            ref2 = [s(i + j), s(i + j + pieceCount)];
            start = ref2[0];
            end = ref2[1];
            pieceLength = distance(start, end);
            wat = averageLineLength / pieceLength;

            for (var u = 0; 0 <= 1/pieceCount ? u < 1/pieceCount : u > 1/pieceCount; u += wat) {
                context.lineTo.apply(context, s(i + j + u));
            }
        }
        return context.lineTo.apply(context, s(i + 1));
    };

    this.initiateCanvas = function (height, width, div, bgColor) {
        canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;
        placeCanvasInDiv(div);
        setContext();
        setCanvasBGColor(bgColor, height, width);

        return canvas;
    }

    this.drawSmoothPaths = function(locations) {
        var lastIndex = locations.length - 1;
            
        if (locations.length >= 2) {
            context.beginPath();
            context.moveTo.apply(context, (locations[0]));
            
            for (var i = 0; i < lastIndex;  i++){
                drawSmoothCurve(i, locations);
            }
                
            context.lineWidth = 2;
            context.strokeStyle = 'rgba(122, 33, 195, 0.62)';
            context.lineJoin = 'round';
            context.lineCap = 'round';

            return context.stroke();
        }
    }
})