ProgressApp.service('PathService', function () {

    var smoothConfig = {
        method: 'lanczos',
        clip: 'clamp',
        lanczosFilterSize: 10,
        cubicTension: 0
    };

    //creates the full path between all assignments
    this.drawSmoothPaperPaths = function(locations, pathLayer) {
        var lastIndex = locations.length - 1;
        pathLayer.activate();
        var path = new paper.Path();

        stylePath(path);

        if (locations.length >= 2) {
            //begin path at the location of the first assignment
            path.add(locations[0]);
            //draw paths forward until the location of the second to last assignment has been reached
            for (var i = 0; i < lastIndex; i++) {
                drawSmoothPaperCurve(i, locations, path);
            }
        }

        path.simplify(20); // nopeuttaa liikkumista jatkossa. alussa hidas operaatio.
    }

    function stylePath(path) {
        //beige
        //path.strokeColor = new paper.Color(0.64, 0.58, 0.50);
        //path.strokeColor = new paper.Color(0.5, 0.1, 0.7);
        path.style = {
            strokeColor: '#48003A',
            strokeWidth: 20,
            strokeJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 7,
            shadowOffset: [5, 5]
        };
        path.opacity = 0.64;
        //path.strokeCap = 'round';
        //path.dashArray = [35, 10];
    }

    //draws a smooth line between two points
    function drawSmoothPaperCurve(i, locations, path) {
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

            for (var u = 0; 0 <= 1 / pieceCount ? u < 1 / pieceCount : u > 1 / pieceCount; u += wat) {
                path.add(s(i + j + u));
            }
        }
        return path.add(s(i + 1));
    };

    //necessary calculation for drawing smooth curves
    function distance(a, b) {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

})