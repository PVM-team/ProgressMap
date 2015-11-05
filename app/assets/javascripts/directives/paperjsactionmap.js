ProgressApp.directive('paperjsmap2', function (CanvasService, AssignmentCirclesService, MoveStudentService, StudentIconService) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            assignments: '=',
            students: '='
        },
        link: function (scope, element, attrs) {
            var mapInitialized = false;
            var maxStudentsInRow = 3;

            var smoothConfig = {
                method: 'lanczos',
                clip: 'clamp',
                lanczosFilterSize: 10,
                cubicTension: 0
            };

            var path;
            paper.install(window);
            paper.setup(element[0]);

            var previousWindowWidth;

            scope.$watch('assignments', function (newval, oldval) {

                if (newval && !mapInitialized) {
                    setCanvas();
                    drawSmoothPaperPaths();
                    placeCirclesOnAssignmentLocations();
                    placeLatestStudents();

                    //original default value for window width in project design phase
                    previousWindowWidth = 1100;
                    mapInitialized = true;
                    paper.view.draw();
                    window.onresize();
                }
            }, true);

            scope.$watch('students', function (newval, oldval) {
                if (newval && mapInitialized) {
                    MoveStudentService.update(scope.assignments, scope.students);
                }
            }, true);


            window.onresize = function () {
                if (mapInitialized) {
                    updateCanvasWidth();
                    scaleButtonsByWidth();
                    scalePathByWidth();
                    previousWindowWidth = window.innerWidth;
                }
            }

            function scalePathByWidth() {
                var segments = path.segments;
                for (var i = 0; i < segments.length; i++) {
                    segments[i].point.x = getRelativeX(segments[i].point.x);
                }
                path.strokeWidth = (path.strokeWidth / previousWindowWidth) * window.innerWidth;
            }

            //the x-position of something in the current window width
            function getRelativeX(x) {
                return (x / previousWindowWidth) * window.innerWidth;
            }

            function scaleButtonsByWidth() {
                var items = paper.project.activeLayer.children;
                for (var i = 0; i < items.length; i++) {
                    if (items[i] != path) {
                        items[i].position.x = getRelativeX(items[i].position.x);
                        items[i].scale(window.innerWidth / previousWindowWidth);
                    }
                }
            }

            function setCanvas() {
                CanvasService.initiatePaperCanvas(element[0], scope.assignments.length, 1100);
            }

            function updateCanvasWidth() {
                var canvas = element[0];
                var width = window.innerWidth;

                canvas.width = width;
                paper.view.viewSize.width = width;

                paper.view.draw();
            }

            function placeLatestStudents() {
                for (var i = 0; i < scope.assignments.length; i++) {
                    placeStudentCirclesForAssignment(scope.assignments[i]);
                }
            }

            function placeStudentCirclesForAssignment(assignment) {
                var verticalPositionOffset = 0;
                var lateralPositionOffset = 60;
                var location = assignment.location;

                for (var j = 0; j < assignment.latestDoers.length; j++) {
                    var studentLocation = new paper.Point(location.x + lateralPositionOffset, location.y + verticalPositionOffset);

                    var studentCircle = new paper.Path.Circle(studentLocation, 20);

                    var student = assignment.latestDoers[j];
                    studentCircle.fillColor = StudentIconService.colorOfCircleOfStudent(student);

                    student['location'] = {'x': studentLocation.x, 'y': studentLocation.y };

                     //student id:s over student circles
                    var text = new paper.PointText({
                        point: new paper.Point(location.x + lateralPositionOffset - 20, location.y + verticalPositionOffset - 20),
                        content: student.id,
                        fillColor: 'white',
                        fontSize: 15
                    });

                    lateralPositionOffset += 40;

                    if ((j + 1) % maxStudentsInRow == 0) {
                        verticalPositionOffset += 40;
                        lateralPositionOffset = 60;
                    }
                }
            }

            function placeCirclesOnAssignmentLocations() {
                for (var i = 0; i < scope.assignments.length; i++) {
                    AssignmentCirclesService.drawCircle(scope.assignments[i], scope.students);
                }
            }

            function drawSmoothPaperPaths() {
                var locations = getLocations(scope.assignments);

                var lastIndex = locations.length - 1;
                path = new paper.Path();

                //beige vaihtoehto
                //path.strokeColor = new paper.Color(0.64, 0.58, 0.50);
                path.strokeColor = new paper.Color(0.5, 0.1, 0.7);

                //path.opacity = 0.62;
                path.strokeWidth = 20;
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

            function drawSmoothPaperCurve(i, locations) {
                var ref, ref2, start, end, pieceLength, wat;

                var s = Smooth(locations, smoothConfig);
                var averageLineLength = 1;
                var pieceCount = 2;
                ref = 1 / pieceCount;

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
            }
        }
    }
})