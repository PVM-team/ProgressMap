ProgressApp.service('CanvasService', function () {

    var canvas;

    var smoothConfig = {
        method: 'lanczos',
        clip: 'zero',
        lanczosFilterSize: 10,
        cubicTension: 0
    };

    //???
    function distance(a, b){
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    function drawQuadratic(x1, y1, x2, y2) {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo((x1+10), (y1+10));
        ctx.quadraticCurveTo(((x2 + x1) / 2), x2, (x2+10), (y2+10));
        ctx.stroke();
    }

    function drawSmoothCurve(context, i, locations) {
        var ref, ref2, start, end, pieceLength, wat;
        var s = Smooth(locations, smoothConfig);
        var averageLineLength = 1;
        var pieceCount = 2;
        var ref = 1/pieceCount;
        for (var j = 0; j < 1; j += ref){
            ref2 = [s(i + j), s(i + j + pieceCount)];
            start = ref2[0];
            end = ref2[1];
            pieceLength = distance(start, end);
            wat = averageLineLength/pieceLength;
            for (var u = 0; 0 <= 1/pieceCount ? u < 1/pieceCount : u > 1/pieceCount; u += wat) {
                context.lineTo.apply(context, s(i + j + u));
            }
        }
        return context.lineTo.apply(context, s(i + 1));
    };


    return {
        initiateCanvas: function (height, width) {
            canvas = document.createElement('canvas');
            canvas.height = height;
            canvas.width = width;
            return canvas;
        },

        placeCanvasInMapElementsDiv: function (canvas) {
            document.getElementById("mapElements").appendChild(canvas);
        },

        drawPaths: function (assignments) {
            for (var i = 0; i < assignments.length - 1; i++) {

                var x1 = assignments[i].location.x
                var y1 = assignments[i].location.y
                var x2 = assignments[i + 1].location.x
                var y2 = assignments[i + 1].location.y

                drawQuadratic(x1, y1, x2, y2);
            }

        },

        drawSmoothPaths: function(locations){
            var lastIndex = locations.length - 1;
            if (locations.length >= 2){
                var ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.moveTo.apply(ctx, (locations[0]));
                for (var i = 0; 0 <= lastIndex ? i < lastIndex: i > lastIndex; 0 <= lastIndex ? i++: i--){
                    drawSmoothCurve(ctx, i, locations);
                }
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#E69DD8';
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                return ctx.stroke();
            }
        },

        setCanvasBGColor: function (hex, context, height, width) {
            context.fillStyle = hex;
            context.fillRect(0, 0, height, width);
        },

        getCanvas: function () {
            return canvas;
        }
    }
})
