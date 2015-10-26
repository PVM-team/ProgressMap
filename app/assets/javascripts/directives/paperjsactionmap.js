ProgressApp.directive('paperjsmap2', function () {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            assignments: '=assignments'
        },
        link: function (scope, element, attrs) {

            var smoothConfig = {
                method: 'lanczos',
                clip: 'clamp',
                lanczosFilterSize: 10,
                cubicTension: 0
            };

            var path;
            paper.setup(element[0]);
            var tool = new paper.Tool();

            scope.$watch('assignments', function (newval, oldval) {
                if (newval) {
                    drawSmoothPaperPaths();
                    placeCirclesOnAssignmentLocations();
                    placeLatestStudents();
                    paper.view.update();
                }
            }, true);

            function placeLatestStudents(){

                var verticalPositionOffset = 0;
                var lateralPositionOffset = 50;

                var maxStudentsInRow = 3;

                for (var i = 0; i < scope.assignments.length; i++){
                    var location = scope.assignments[i].location;
                    for (var j = 0; j < scope.assignments[i].latestDoers.length; j++){
                        var studentCircle = new paper.Path.Circle(new paper.Point(location.x + lateralPositionOffset,
                            location.y + verticalPositionOffset), 15);
                        studentCircle.fillColor = 'grey';
                        lateralPositionOffset += 30;

                        if ((j+1) % maxStudentsInRow == 0){
                            verticalPositionOffset += 30;
                            lateralPositionOffset = 50;
                        }
                    }
                    //moving on to latest doers of next assignment
                    lateralPositionOffset = 50;
                    var verticalPositionOffset = 0;
                }
            }

            function placeCirclesOnAssignmentLocations() {
                var locations = getLocations();

                for (var i = 0; i < locations.length; i++) {
                    var assignmentCircle = new paper.Path.Circle(locations[i], 25);
                    assignmentCircle.fillColor = 'blue';
                }
            }

            function drawSmoothPaperPaths() {
                var locations = getLocations(scope.assignments);

                var lastIndex = locations.length - 1;
                var path = new paper.Path();

                //beige vaihtoehto
                //path.strokeColor = new paper.Color(0.64, 0.58, 0.50);
                path.strokeColor = new paper.Color(0.5, 0.1, 0.7);

                //path.opacity = 0.62;
                path.strokeWidth = 14;
                path.strokeJoin = 'round';
                //path.strokeCap = 'round';
                //path.dashArray = [35, 10];

                if (locations.length >= 2) {
                    path.add(locations[0]);

                    for (var i = 0; i < lastIndex; i++) {
                        drawSmoothPaperCurve(i, locations, path);
                    }
                }
            }

            function getLocations() {
                var locations = [];

                for (var i = 0; i < scope.assignments.length; i++) {
                    locations.push([scope.assignments[i].location.x, scope.assignments[i].location.y]);
                }
                return locations;
            }

            function distance(a, b) {
                return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
            }

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

            tool.onMouseDown = function (event) {
                path = new paper.Path();
                path.strokeColor = 'black';
            };
            tool.onMouseDrag = function (event) {
                path.add(event.point);
            };
            tool.onMouseUp = function (event) {
                //nothing special here
            };
        }
    }
})
