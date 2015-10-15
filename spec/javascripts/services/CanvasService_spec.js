describe('CanvasService', function () {
    var service, canvas;

    beforeEach(function () {
        module('ProgressApp');

        inject(function (_CanvasService_) {
            service = _CanvasService_
        });

        canvas = service.initiateCanvas(25, 1000, "", "rgba(30, 85, 205, 0.50");
    });


    describe('initiateCanvas', function() {

        it('returns an object', function () {
            expect(angular.isObject(canvas)).toBe(true)
        })

        it('sets its width and height to the values given as parameters', function () {
            var expectedWidth = 1000 + 100;
            var expectedHeight = 250 * 7 + 100;

            expect(canvas.width).toBe(expectedWidth);
            expect(canvas.height).toBe(expectedHeight)
            expect(service.levelHeight()).toEqual(250);
            expect(service.lastLevelFull(0)).toBe(true);
        })
    })

    it('drawSmoothPaths modifies the context of canvas', function () {
        var assignments = [{'location': {'x': 100, 'y': 250}},
                           {'location': {'x': 330, 'y': 180}},
                           {'location': {'x': 500, 'y': 130}}];

        service.drawSmoothPaths(assignments);

        var context = service.getContext();

        expect(context.lineWidth > 0).toBe(true);
        expect(context.lineJoin).toBe('round');
        expect(context.lineCap).toBe('round');
    })

    describe('drawLocationForAssignment', function() {

        it('drawn location with index 0 and no previous location returns a valid location', function() {

            for (var i = 0; i < 20; i++) {  // satunnaisuuden vuoksi 20 testausta peräkkäin
                service.initiateCanvas(25, 1000, "", "rgba(30, 85, 205, 0.50"); // servicen tila muuttuu joka drawLocationForAssignmentin jälkeen joten alustetaan uudelleen.
                var locations = [];
                var location = service.drawLocationForAssignment(0, locations);

                var xStart = 100;
                var yStart = 250 * 6 + 100;  // level = 6, border = 100

                locationIsInBlock(location, xStart, yStart);
            }
        })

        describe ('drawn location with index 1 and previous location with index 0 returns a valid location', function() {

            it ("which can be found anywhere inside its 'block' if the previous location is more than 120px away from the block", function() {
            
                for (var i = 0; i < 20; i++) {  // satunnaisuuden vuoksi 20 testausta peräkkäin
                    service.initiateCanvas(25, 1000, "", "rgba(30, 85, 205, 0.50"); // servicen tila muuttuu joka drawLocationForAssignmentin jälkeen joten alustetaan uudelleen.

                    var prev = {'x': 100 + 50, 'y': 250 * 6 + 100 + 37};

                    var locations = [prev];

                    var location = service.drawLocationForAssignment(0, locations);

                    var xStart = 100;
                    var yStart = 250 * 6 + 100;  // level = 6, border = 100

                    locationIsInBlock(location, xStart, yStart);
                }
            })

            it ("which is in its 'block', but with requirement that distance to the previous location is at least 120px", function() {
                for (var i = 0; i < 20; i++) {  // satunnaisuuden vuoksi 20 testausta peräkkäin
                    service.initiateCanvas(25, 1000, "", "rgba(30, 85, 205, 0.50"); // servicen tila muuttuu joka drawLocationForAssignmentin jälkeen joten alustetaan uudelleen.
                    var prev = {'x': 100 + 199, 'y': 250 * 6 + 100 + 199};
                    var locations = [prev];
                    var location = service.drawLocationForAssignment(0, locations);

                    var xStart = 100;
                    var yStart = 250 * 6 + 100;  // level = 6, border = 100

                    locationIsInBlock(location, xStart, yStart);
                    expect(distanceBetweenLocations(location, locations[0])).toBeGreaterThan(120);
                }
            })
        })

        it('the direction of curve changes during the drawing, and the 9 first locations are drawn into blocks they belong to', function() {
            
            for (var j = 0; j < 20; j++) {  // 20 test cases

                service.initiateCanvas(25, 1000, "", "rgba(30, 85, 205, 0.50");
                var locations = [];
                var location = null;
                var i = 0;


                while (i < 4) {
                    location = service.drawLocationForAssignment(i, locations);
                    locationIsInBlock(location, i * 250 + 100, 250 * 6 + 100);


                    if (locations[i - 1]) {
                        expect(distanceBetweenLocations(location, locations[i - 1]) >= 120).toBe(true);
                    }

                    locations.push(location);
                    i++;
                }

                while (i < 8) {
                    location = service.drawLocationForAssignment(i, locations);
                    locationIsInBlock(location, 100 - (i % 4) * 250 + 3 * 250, 250 * 5 + 100);

                    expect(distanceBetweenLocations(location, locations[i - 1]) >= 120).toBe(true);

                    locations.push(location);
                    i++;
                }

                location = service.drawLocationForAssignment(i, locations);
                locationIsInBlock(location, 100, 250 * 4 + 100);
            }
        })

        it('7 previous locations should be at least 120px away from new location', function() {

            for (var j = 0; j < 20; j++) {  // 20 test cases

                service.initiateCanvas(25, 1000, "", "rgba(30, 85, 205, 0.50");
                var locations = [];
                var location = null;
                var i = 0;


                while (i < 500) {
                    location = service.drawLocationForAssignment(i, locations);
                    var n = 0;

                    if ((locations.length - 7) < 0) {
                        n = 0;
                    } else {
                        n = locations.length - 7;
                    }

                    for (var k = n ; k < locations.length; k++) {
                        expect(distanceBetweenLocations(location, locations[k])).toBeGreaterThan(119);
                    }

                    locations.push(location);
                    i++;
                }
            }
        })

        it('locations for new assignment are in correct blocks', function() {
            for (var j = 0; j < 20; j++) {  // 20 test cases

                service.initiateCanvas(25, 1000, "", "rgba(30, 85, 205, 0.50");
                var location = null;
                var prev = null;
                var i = 0;


                while (i < 4) {
                    location = service.locationOfNewAssignment(i, prev);
                    locationIsInBlock(location, i * 250 + 100, 250 * 6 + 100);


                    if (prev) {
                        expect(distanceBetweenLocations(location, prev) >= 120).toBe(true);
                    }

                    prev = location;
                    i++;
                }

                while (i < 8) {
                    location = service.locationOfNewAssignment(i, prev);
                    locationIsInBlock(location, 100 - (i % 4) * 250 + 3 * 250, 250 * 5 + 100);

                    expect(distanceBetweenLocations(location, prev) >= 120).toBe(true);

                    prev = location;
                    i++;
                }
            }
        })
    })
})

function locationIsInBlock(location, xStart, yStart) {
    expect(location.x >= xStart && location.x < xStart + 200).toBe(true)
    expect(location.y >= yStart && location.y < yStart + 200).toBe(true)
}

function distanceBetweenLocations(location1, location2) {
    return distance([location1.x, location1.y], [location2.x, location2.y]);
}

function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}