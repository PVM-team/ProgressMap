ProgressApp.service('CanvasService', function () {

    var canvas;
    var context;

    var direction;
    //var direction = left; // direction vaihtuu joka arpomisen jälkeen

    var borderSize;
    var blockSize;
    var assignmentsPerLevel;
    var levelAmount;

    var smoothConfig = {
        method: 'lanczos',
        clip: 'clamp',
        lanczosFilterSize: 10,
        cubicTension: 0
    };

    this.initiateCanvas = function (id, assignmentCount, width, div, bgColor) {
        canvas = document.getElementById(id);

        borderSize = width / 40; // 25
        blockSize = width / 5; // 200
        assignmentsPerLevel = width / (2 * borderSize + blockSize) // 4, kuinka monta tehtävää on per taso
        levelAmount = Math.ceil(assignmentCount / assignmentsPerLevel) // kuinka paljon tasoja tarvitaan

        direction = "left"; // suunta vaihtuu heti drawLocationForAssignment() funktion alussa.

        // if (levelAmount % 2 == 0) {
        //    changeDirectionOfCurve();   // direction vaihtuu joka arpomisen jälkeen
        //}

        canvas.height = (2 * borderSize + blockSize) * levelAmount + 100;
        canvas.width = width + 100; // 50 pikseliä lisää reunoja varten
        //placeCanvasInDiv(div);
        setContext();
        //setCanvasBGColor(bgColor);

        return canvas;
    }

    this.initiatePaperCanvas = function (id, assignmentCount, width) {
        canvas = document.getElementById(id);

        borderSize = width / 40; // 25
        blockSize = width / 5; // 200
        assignmentsPerLevel = width / (2 * borderSize + blockSize) // 4, kuinka monta tehtävää on per taso
        levelAmount = Math.ceil(assignmentCount / assignmentsPerLevel) // kuinka paljon tasoja tarvitaan

        direction = "left"; // suunta vaihtuu heti drawLocationForAssignment() funktion alussa.

        // if (levelAmount % 2 == 0) {
        //    changeDirectionOfCurve();   // direction vaihtuu joka arpomisen jälkeen
        //}

        canvas.height = (2 * borderSize + blockSize) * levelAmount + 100;
        canvas.width = width + 100; // 50 pikseliä lisää reunoja varten
        //placeCanvasInDiv(div);
        setContext();
        //setCanvasBGColor(bgColor);

        return canvas;
    }

    //should not be called before initiateCanvas has been called at least once
    this.redraw = function(bgColor){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function placeCanvasInDiv(div) {
        if (div) {
            div.appendChild(canvas);
        }
    }

    function setContext(){
        context = canvas.getContext("2d");
    }

    function setCanvasBGColor(bgColor) {
        context.fillStyle = bgColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }


    this.drawLocationForAssignment = function(i, locations) {
        if (i % assignmentsPerLevel == 0) {
            changeDirectionOfCurve();
        }

        return drawLocation(i, locations);
    }

    this.locationOfNewAssignment = function(i, prevLocation) {
        direction = "right";    // jos direction = "left", arpoo pisteet toiseen suuntaan alhaalta ylös

        if (i % (2 * assignmentsPerLevel) >= assignmentsPerLevel) {
            changeDirectionOfCurve();
        }

        if (prevLocation == null) {
            return drawLocation(i, []);
        }

        var locations = [prevLocation];

        return drawLocation(i, locations);
    }

    function drawLocation(i, locations) {
        var xStart = defineXStart(i, direction);
        var yStart = defineYStart(i);

        var amountOfPreviousLocationsToCheck = Math.max(0, locations.length - 7);
        var x = getRandomPosition(xStart);
        var y = getRandomPosition(yStart);

        var location = {'x': x, 'y': y};

        for (var j = amountOfPreviousLocationsToCheck; j < locations.length; j++) {
            while (!drawnLocationValid(location, locations[j])) {
                x = getRandomPosition(xStart);
                y = getRandomPosition(yStart);
                location = {'x': x, 'y': y};

                j = amountOfPreviousLocationsToCheck;
            }
        }

        return location;
    }

    function changeDirectionOfCurve() {
        if (direction === "left") {
            direction = "right";
            return;
        }
        direction = "left";
    }

    function defineXStart(i, direction) {
        //50 pixeliä otettaan huomioon reunaa varten
        var border = 50 + 2 * borderSize;
        var relativeStartingPosition = (i % assignmentsPerLevel) * (2 * borderSize + blockSize);

        if (direction === "right") {
            return border + relativeStartingPosition;
        }
        else if (direction === "left") {
            return border - relativeStartingPosition + (assignmentsPerLevel - 1) * (2 * borderSize + blockSize);
        }

        throw "Direction value not defined";
    }

    function defineYStart(i) {
        var level = Math.ceil(levelAmount - (i / assignmentsPerLevel)) - 1;

        // 50 pikselin lisäreunus ylös

        return 50 + 2 * borderSize + level * (2 * borderSize + blockSize);
    }

    function getRandomPosition(start) {
        return Math.floor((Math.random() * blockSize) + start);
    }

    // ei poisteta tätä metodia turhaan. voidaan muokata myöhemmin validointia paremmaksi.

    function drawnLocationValid(location, prevLocation) {
        return distanceBetweenLocations(location, prevLocation) >= 120;
    }

    function distanceBetweenLocations(location1, location2) {
        return distance([location1.x, location1.y], [location2.x, location2.y]);
    }

    function distance(a, b) {   // kutsutaan myös toisessa algoritmissa joka piirtää viivat pisteiden välille
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    this.lastLevelFull = function(assignmentCount) {
        return assignmentCount % assignmentsPerLevel == 0;
    }

    this.levelHeight = function() {
        return 2 * borderSize + blockSize;
    }


    this.drawSmoothPaths = function(assignments) {
        var locations = getLocations(assignments);

        var lastIndex = locations.length - 1;

        if (locations.length >= 2) {
            context.beginPath();
            context.moveTo.apply(context, (locations[0]));

            for (var i = 0; i < lastIndex;  i++){
                drawSmoothCurve(i, locations);
            }

            context.lineWidth = 14;
            context.strokeStyle = 'rgba(122, 33, 195, 0.62)';
            context.lineJoin = 'round';
            context.lineCap = 'round';

            return context.stroke();
        }
    }

    function getLocations(assignments) {
        var locations = [];

        for (var i = 0; i < assignments.length; i++) {
            locations.push([assignments[i].location.x, assignments[i].location.y]);
        }
        return locations;
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

    this.getContext = function() {
        return context;
    }
})