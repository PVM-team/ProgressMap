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

            //dependent circles of circle mouse is currently hovering over
            var DEPENDENTS = [];
            var HOVERED_CIRCLE = null;
            var ORIGINALS = [];

            var smoothConfig = {
                method: 'lanczos',
                clip: 'clamp',
                lanczosFilterSize: 10,
                cubicTension: 0
            };

            function getDoneFillColor(assignmentCircle) {
                return {
                    gradient: {
                        stops: [['#B8e297', 0.1], ['#87bc5e', 0.5], ['#3c7113', 1]],
                        radial: true
                    },
                    origin: assignmentCircle.position,
                    destination: assignmentCircle.bounds.rightCenter
                };
            }

            function getUndoneFillColor(assignmentCircle) {
                return {
                    gradient: {
                        stops: [['#ffca6a', 0.1], ['#ffb93a', 0.4], ['#a96d00', 1]],
                        radial: true
                    },
                    origin: assignmentCircle.position,
                    destination: assignmentCircle.bounds.rightCenter
                };
            }

            var pathLayer;
            var dependencyArrowLayer;
            var assignmentLayer;
            var textLayer;
            var triangleLayer;

            var path;
            paper.install(window);
            paper.setup(element[0]);
            var tool = new paper.Tool();

            scope.$watch('assignments', function (newval, oldval) {
                if (newval && !mapInitialized) {
                    setCanvasSize();
                    initializeLayers();
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

            paper.view.onFrame = function (event) {
                if (HOVERED_CIRCLE) {
                    moveDependencyArrows(event);

                    for (var i = 0; i < DEPENDENTS.length; i++) {
                        putDependencyLightOn(i);
                    }
                } else {
                    for (var i = 0; i < DEPENDENTS.length; i++) {
                        putDependencyLightOff(i);
                    }
                    DEPENDENTS = [];
                    ORIGINALS = [];
                }
            }

            function putDependencyLightOn(index) {
                var dependentCircle = DEPENDENTS[index];
                dependentCircle.shadowColor.alpha += 0.1;
                dependentCircle.fillColor.alpha += 0.1;

                var originalCircle = ORIGINALS[index];
                originalCircle.shadowColor.alpha -= 0.1;
            }

            function putDependencyLightOff(index) {
               var dependentCircle = DEPENDENTS[index];
               var originalCircle = ORIGINALS[index];
               var interval = setInterval(function(){
                   if(dependentCircle.fillColor.alpha == 0) {
                        dependentCircle.remove();
                        clearInterval(interval);
                   }
                   dependentCircle.shadowColor.alpha -= 0.1;
                   dependentCircle.fillColor.alpha -= 0.1;
                   originalCircle.shadowColor.alpha += 0.1;
               }, 60); 
            }

            function moveDependencyArrows(event){
                var end = HOVERED_CIRCLE.position;
                var paths = dependencyArrowLayer.children;

                var arrowheads = triangleLayer.children;

                for (var i = 0; i < paths.length; i++) {
                    var start = paths[i].firstSegment.point;
                    var radius = HOVERED_CIRCLE.radius;
                    console.log(radius);
                    var circleEdge = end.add((start.subtract(end)).normalize().multiply(radius));

                    var vector = circleEdge.subtract(start);

                    var vectorLength = vector.length;

                    if (paths[i].length <= vectorLength) {
                        vector = vector.normalize().multiply(event.delta);
                        growPath(paths[i], arrowheads[i], vector, vectorLength, circleEdge);
                    }
                }
            }

            function moveArrow(arrow, position){
                arrow.position = position;
            }


            function growPath(path, arrowH, position, vectorLength, circleEdge) {
                var lastPos = path.lastSegment.point;
                var newPos = lastPos.add(position.multiply(1000));
                var newPieceLength = (newPos.subtract(lastPos)).length;
                if ((path.length + newPieceLength) > vectorLength) {
                    moveArrow(arrowH, circleEdge);
                    path.add(circleEdge);
                } else {
                    moveArrow(arrowH, newPos);
                    path.add(newPos);
                }
            }

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

            function initializeLayers() {
                pathLayer = new paper.Layer();
                dependencyArrowLayer = new paper.Layer();
                dependencyArrowLayer.locked = true;
                triangleLayer = new paper.Layer();
                assignmentLayer = new paper.Layer();
                textLayer = new paper.Layer();
                textLayer.locked = true;
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
                var locations = getLocations();

                for (var i = 0; i < locations.length; i++) {
                    var assignmentCircle = new paper.Shape.Circle(locations[i], 35);
                    assignmentCircle.style = {
                        fillColor: '#f18c3a',
                        shadowColor: 'black',
                        shadowBlur: 12,
                        shadowOffset: [5, 5]
                    }
                    assignmentCircle.opacity = 0.8;

                    setDependencyFunctions(scope.assignments[i], assignmentCircle);

                    assignmentLayer.addChild(assignmentCircle);

                    //assignment numbers over assignment circles
                    var text = new paper.PointText({

                        point: [locations[i][0], locations[i][1] + 6],
                        content: i + 1,
                        fillColor: 'black',
                        fontSize: 20,
                        justification: 'center'
                    });


                    //asettaa funktiot joita kutsutaan kun tekstin päälle viedään hiiri ja viedään se pois
                    //funktiot ovat samat kuin assignment circleillä
                    setDependencyFunctions(scope.assignments[i], text);
                    textLayer.addChild(text);
                }
            }

            /*
            function onFrame(event) {
                dependentCircle.shadowColor.hue += event.time*10;
            }*/

            function setDependencyFunctions(assignment, item) {
                item.onMouseEnter = function (event) {
                    for (var i = 0; i < assignment.dependencies.length; i++) {
                        var dependent = AssignmentDependenciesService.findAssignmentById(scope.assignments, assignment.dependencies[i].id);
                        var dependentCircle = new paper.Path.Circle([getRelativeXFromDefaultSize(dependent.location.x), dependent.location.y], 50);
                        var originalCircle = assignmentLayer.hitTest([getRelativeXFromDefaultSize(dependent.location.x), dependent.location.y]).item;

                        if (dependentCircle) {
                            DEPENDENTS.push(dependentCircle);
                            ORIGINALS.push(originalCircle);

                            var startingPoint = dependentCircle.position;
                            dependencyArrowLayer.activate();
                            var path = new paper.Path();
                            path.add(startingPoint);
                            path.strokeWidth = 10;
                            path.strokeColor = '#F2D27E';
                            //path.strokeColor.alpha = 0.8;
                            path.shadowColor = 'black';
                            path.shadowOffset = [5,5];

                            createArrowhead(item, originalCircle);


                            pathLayer.addChild(dependentCircle);

                            var dependencyLightColor = new Color('#F2D27E');
                            var dependencyLightColor2 = {
                                gradient: {
                                    stops: [['yellow', 0.4], [new Color(25,25,25,0), 1]],
                                    radial: true
                                },
                                origin: dependentCircle.position,
                                destination: dependentCircle.bounds.rightCenter
                            };

                            dependentCircle.style = {
                                strokeWidth: 0,
                                fillColor: dependencyLightColor,
                                shadowColor: dependencyLightColor,
                                shadowBlur: 15,
                                shadowOffset: [0, 0]
                            };
                            dependentCircle.fillColor.alpha = 0;

                        }
                    }
                    HOVERED_CIRCLE = item;
                }

                item.onMouseLeave = function (event) {
                    HOVERED_CIRCLE = null;
                    dependencyArrowLayer.removeChildren();
                    triangleLayer.removeChildren();
                    for (var i = 0; i < assignment.dependencies.length; i++) {
                        var dependent = AssignmentDependenciesService.findAssignmentById(scope.assignments, assignment.dependencies[i].id);
                        var dependentCircle = assignmentLayer.hitTest([getRelativeXFromDefaultSize(dependent.location.x), dependent.location.y]).item;
                        if (dependentCircle) {
                            /*dependentCircle.style = {
                              shadowColor: 'black',
                              shadowBlur: 12,
                              shadowOffset: [5, 5]
                              }*/
                        }
                    }
                }
            }

            function createArrowhead(pointsAt, startsAt){
                triangleLayer.activate();
                var triangle = new paper.Path.RegularPolygon(startsAt.position, 3, 25);
                triangle.fillColor = '#F2D27E';
                //triangle.fillColor.alpha = 0.8;
                var angle = Math.atan2(pointsAt.position.y - startsAt.position.y, pointsAt.position.x - startsAt.position.x);
                angle = angle*(180/Math.PI);
                if (angle < 0){
                    angle = 360 - (-angle);
                }
                triangle.rotate(90+angle)
            }

            function drawSmoothPaperPaths() {
                var locations = getLocations(scope.assignments);

                var lastIndex = locations.length - 1;
                path = new paper.Path();
                pathLayer.addChild(path);

                //beige vaihtoehto
                // path.strokeColor = new paper.Color(0.64, 0.58, 0.50);
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
