//paperjsmap per student, no dependency display operations yet
ProgressApp.directive('paperjsmap', function (AssignmentDependenciesService) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            assignments: '=',
            doneAssignments: '='
        },
        link: function (scope, element, attrs) {

            var previousWindowWidth;
            var mapInitialized = false;

            var smoothConfig = {
                method: 'lanczos',
                clip: 'clamp',
                lanczosFilterSize: 10,
                cubicTension: 0
            };

            function getDoneFillColor(assignmentCircle){
                return {
                    gradient: {
                        stops: [['#B8e297',0.1], ['#87bc5e', 0.5], ['#3c7113', 1]],
                        radial: true
                    },
                    origin: assignmentCircle.position,
                    destination: assignmentCircle.bounds.rightCenter
                };
            }

            function getUndoneFillColor(assignmentCircle){
                return {
                    gradient: {
                        stops: [['#ffca6a',0.1], ['#ffb93a', 0.4], ['#a96d00', 1]],
                        radial: true
                    },
                    origin: assignmentCircle.position,
                    destination: assignmentCircle.bounds.rightCenter
                };
            }

            var assignmentLayer;
            var pathLayer;
            var textLayer;
            var path;
            paper.install(window);
            paper.setup(element[0]);
            var tool = new paper.Tool();

            scope.$watch('assignments', function (newval, oldval) {
                if (newval && !mapInitialized) {
                    setCanvasSize();
                    drawSmoothPaperPaths();
                    placeCirclesOnAssignmentLocations();

                    previousWindowWidth = 1100;
                    mapInitialized = true;
                    paper.view.update();
                    window.onresize();
                }
            }, true);

            scope.$watch('doneAssignments', function (newval, oldval) {
                if (newval && mapInitialized) {
                    changeAssignmentColors();
                    paper.view.update();
                }
            }, true);

            window.onresize = function () {
                if (mapInitialized) {
                    updateCanvasWidth();
                    scaleButtonsByWidth();
                    scaleLabelsByWidth();
                    scalePathByWidth();
                    previousWindowWidth = window.innerWidth;
                }
            }

            function updateCanvasWidth() {
                var canvas = element[0];
                var width = window.innerWidth;

                canvas.width = width;
                paper.view.viewSize.width = width;

                paper.view.draw();
            }

            function setCanvasSize() {
                var width = window.innerWidth;
                var defaultWidth = 1100;

                var canvas = element[0];

                var borderSize = defaultWidth / 40; // 25
                var blockSize = defaultWidth / 5; // 200
                var assignmentsPerLevel = defaultWidth / (2 * borderSize + blockSize); // 4, kuinka monta tehtävää on per taso
                var levelAmount = Math.ceil(scope.assignments.length / assignmentsPerLevel); // kuinka paljon tasoja tarvitaan

                var height = (2 * borderSize + blockSize) * levelAmount + 100;

                canvas.height = height;
                canvas.width = width;

                paper.view.viewSize = new paper.Size(width, height);
                paper.view.draw();
            }

            function scaleButtonsByWidth() {
                var items = assignmentLayer.children;
                for (var i = 0; i < items.length; i++) {
                    if (items[i] != path) {
                        items[i].position.x = getRelativeX(items[i].position.x);
                        items[i].scale(window.innerWidth / previousWindowWidth);
                    }
                }
            }

            function scaleLabelsByWidth() {
                var items = textLayer.children;
                for (var i = 0; i < items.length; i++) {
                        items[i].position.x = getRelativeX(items[i].position.x);
                        items[i].scale(window.innerWidth / previousWindowWidth);
                }
            }

            function scalePathByWidth() {
                var segments = path.segments;
                for (var i = 0; i < segments.length; i++) {
                    segments[i].point.x = getRelativeX(segments[i].point.x);
                }
                path.strokeWidth = (path.strokeWidth / previousWindowWidth) * window.innerWidth;
            }

            function placeCirclesOnAssignmentLocations() {
                assignmentLayer = new paper.Layer();
                textLayer = new paper.Layer();
                var locations = getLocations();

                for (var i = 0; i < locations.length; i++) {
                    var assignmentCircle = new paper.Path.Circle(locations[i], 35);
                    assignmentCircle.style = {
                        fillColor : '#f18c3a',
                        shadowColor: 'black',
                        shadowBlur: 12,
                        shadowOffset: [5,5]
                    }
                    assignmentCircle.opacity = 0.8;

                    setDependencyFunctions(scope.assignments[i], assignmentCircle);

                    assignmentLayer.addChild(assignmentCircle);

                    //assignment numbers over assignment circles
                    var text = new paper.PointText({

                        point: [locations[i][0], locations[i][1]+6],
                        content: i + 1,
                        fillColor: 'black',
                        fontSize: 20,
                        justification: 'center'
                    });
                    textLayer.addChild(text);
                }
            }

            function setDependencyFunctions(assignment, circle){
                circle.onMouseEnter = function(event) {
                    for (var i = 0; i < assignment.dependencies.length; i++) {
                        var dependent = AssignmentDependenciesService.findAssignmentById(scope.assignments, assignment.dependencies[i].id);
                        var dependentCircle = assignmentLayer.hitTest([getRelativeXFromDefaultSize(dependent.location.x), dependent.location.y]).item;
                        if (dependentCircle){
                            dependentCircle.fillColor = '#ffd700';
                        }
                    }
                }

                circle.onMouseLeave = function(event) {
                    for (var i = 0; i < assignment.dependencies.length; i++) {
                        var dependent = AssignmentDependenciesService.findAssignmentById(scope.assignments, assignment.dependencies[i].id);
                        var dependentCircle = assignmentLayer.hitTest([getRelativeXFromDefaultSize(dependent.location.x), dependent.location.y]).item;
                        if (dependentCircle){
                            if (scope.doneAssignments.indexOf(dependent) >= 0){
                                dependentCircle.fillColor = getDoneFillColor(dependentCircle);
                            } else {
                                dependentCircle.fillColor = getUndoneFillColor(dependentCircle);
                            }
                        }
                    }
                }

            }

            function drawSmoothPaperPaths() {
                var locations = getLocations(scope.assignments);
                pathLayer = new paper.Layer();

                var lastIndex = locations.length - 1;
                path = new paper.Path();
                pathLayer.addChild(path);

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

            function changeAssignmentColors() {
                setAllUndone();
                for (var i = 0; i < scope.doneAssignments.length; i++) {
                    //scope.doneAssignments stores locations with default map width of 1100
                    var relativeX = getRelativeXFromDefaultSize(scope.doneAssignments[i].location.x);
                    var assignmentCircle = assignmentLayer.hitTest([relativeX, scope.doneAssignments[i].location.y]).item;
                    if (assignmentCircle) {
                        //assignmentCircle.fillColor = '#29C124';
                        assignmentCircle.fillColor = getDoneFillColor(assignmentCircle);
                    }
                }
            }

            function setAllUndone() {
                var locations = getLocations();
                for (var i = 0; i < locations.length; i++) {
                    //scope.doneAssignments stores locations with default map width of 1100
                    var relativeX = getRelativeXFromDefaultSize(locations[i][0]);
                    var assignmentCircle = assignmentLayer.hitTest([relativeX, locations[i][1]]).item;
                    //assignmentCircle.fillColor = '#F18C3A';
                    assignmentCircle.fillColor = getUndoneFillColor(assignmentCircle);
                }
            }

            //the x-position of something in the current window width
            function getRelativeX(x) {
                return (x / previousWindowWidth) * window.innerWidth;
            }

            //the x-position of something in the current window width, with the default width of 1100
            function getRelativeXFromDefaultSize(x) {
                return (x / 1100) * window.innerWidth;
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

            //old testing functions
            /*tool.onMouseDown = function (event) {
              path = new paper.Path();
              path.strokeColor = 'black';
              };
              tool.onMouseDrag = function (event) {
              path.add(event.point);
              };
              tool.onMouseUp = function (event) {
            //nothing special here
            };*/
        }
    }
})
