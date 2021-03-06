ProgressApp.directive('studentmap', function (MapScaleService, AssignmentCirclesService, PathService) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            assignments: '=',
            doneAssignments: '='
        },
        link: function (scope, element, attrs) {

            var mapInitialized = false;

            //dependent circles of circle mouse is currently hovering over
            var DEPENDENTS = [];
            var HOVERED_CIRCLE = null;
            var ORIGINALS = [];

            var pathLayer;
            var dependencyLineLayer;
            var lightLayer;
            var assignmentLayer;
            var textLayer;
            var arrowheadLayer;

            paper.install(window);
            paper.setup(element[0]);

            scope.$watch('assignments', function (newval, oldval) {
                if (newval && !mapInitialized) {
                    setCanvasSize();
                    initializeLayers();
                    PathService.drawSmoothPaperPaths(getLocations(), pathLayer);
                    placeCirclesOnAssignmentLocations();

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

            paper.view.onFrame = function(event) {
                if (HOVERED_CIRCLE) {
                    moveDependencyArrows(event);
                    incrementDependencyLight();
                } else {
                    for (var i = 0; i < DEPENDENTS.length; i++) {
                        dimDependencyLight(i);
                    }
                    DEPENDENTS = [];
                    ORIGINALS = [];
                }
            }

            function incrementDependencyLight() {
                for (var i = 0; i < DEPENDENTS.length; i++) {
                    var dependentLight = DEPENDENTS[i];
                    dependentLight.shadowColor.alpha += 0.1;
                    dependentLight.fillColor.alpha += 0.1;

                    var originalCircle = ORIGINALS[i];
                    originalCircle.shadowColor.alpha -= 0.1;
                }
            }

            function dimDependencyLight(index) {
                var dependentLight = DEPENDENTS[index];
                var originalCircle = ORIGINALS[index];
                var interval = setInterval(function () {
                    if (dependentLight.fillColor.alpha == 0) {
                        dependentLight.remove();
                        clearInterval(interval);
                    }
                    dependentLight.shadowColor.alpha -= 0.1;
                    dependentLight.fillColor.alpha -= 0.1;
                    originalCircle.shadowColor.alpha += 0.1;
                }, 60);
            }

            //all dependency arrows grow by one increment
            function moveDependencyArrows(event) {
                var paths = dependencyLineLayer.children;
                var arrowheads = arrowheadLayer.children;

                for (var i = 0; i < paths.length; i++) {
                    var start = paths[i].firstSegment.point;
                    var circleEdge = getCircleEdge(HOVERED_CIRCLE, start);

                    var vector = circleEdge.subtract(start);
                    var vectorLength = vector.length;

                    //path is not yet longer than the full line from start to finish, grows by one increment
                    if (paths[i].length < vectorLength) {
                        //arrows grow at same rate regardless of system fps
                        vector = vector.normalize().multiply(event.delta);
                        growPath(paths[i], arrowheads[i], vector, vectorLength, circleEdge);
                    }
                }
            }

            //returns the point near the target circle where a dependency arrow ought to stop
            function getCircleEdge(circle, start) {
                //radius + arrowhead size scaled
                var radius = (circle.length / (2 * Math.PI)) + 17 * MapScaleService.scaleToDefault();
                var end = circle.position;
                var circleEdge = end.add((start.subtract(end)).normalize().multiply(radius));
                return circleEdge;
            }

            function moveArrowhead(arrow, position) {
                arrow.position = position;
            }

            //grows depedency arrow according to speed by one increment
            function growPath(path, arrowH, position, vectorLength, circleEdge) {
                var lastPos = path.lastSegment.point;

                var speed = 500;
                var newPos = lastPos.add(position.multiply(speed));

                var newPieceLength = (newPos.subtract(lastPos)).length;
                if ((path.length + newPieceLength) > vectorLength) {
                    moveArrowhead(arrowH, circleEdge);
                    path.add(circleEdge);
                } else {
                    moveArrowhead(arrowH, newPos);
                    path.add(newPos);
                }
            }


            window.onresize = function () {
                if (mapInitialized) {
                    updateCanvasWidth();
                    MapScaleService.scaleItems(assignmentLayer);
                    MapScaleService.scaleItems(textLayer);
                    MapScaleService.scalePath(pathLayer);
                    MapScaleService.setPreviousWindowWidth(window.innerWidth);
                }
            }

            function updateCanvasWidth() {
                var canvas = element[0];
                var width = window.innerWidth;

                canvas.width = width;
                paper.view.viewSize.width = width;

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
            }

            function initializeLayers() {
                pathLayer = new paper.Layer();
                dependencyLineLayer = new paper.Layer();
                lightLayer = new paper.Layer();
                assignmentLayer = new paper.Layer();
                arrowheadLayer = new paper.Layer();
                textLayer = new paper.Layer();
                textLayer.locked = true;
            }

            function placeCirclesOnAssignmentLocations() {
                var locations = getLocations();

                for (var i = 0; i < locations.length; i++) {
                    var circle = AssignmentCirclesService.createAssignmentCircle(assignmentLayer, textLayer, locations[i], i);
                    AssignmentCirclesService.setStudentAssignmentCircleStyle(circle);
                    setMouseEventFunctions(scope.assignments[i], circle);

                }
            }

            //return an array of assignment locations saved in scope.assignments
            function getLocations() {
                var locations = [];

                for (var i = 0; i < scope.assignments.length; i++) {
                    locations.push([scope.assignments[i].location.x, scope.assignments[i].location.y]);
                }
                return locations;
            }

            //functions to be called when an assignment circle is hovered over, and when mouse leaves an assignment circle
            function setMouseEventFunctions(assignment, item) {
                item.onMouseEnter = function (event) {
                    for (var i = 0; i < assignment.dependencies.length; i++) {
                        var dependent = findAssignmentById(scope.assignments, assignment.dependencies[i].id);
                        var originalCircle = assignmentLayer.hitTest([MapScaleService.getRelativeXFromDefaultSize(dependent.location.x), dependent.location.y]).item;

                        if (originalCircle) {
                            createDependencyLight(originalCircle);
                            createDependencyArrow(originalCircle.position, item);
                        }
                    }
                    HOVERED_CIRCLE = item;
                }

                item.onMouseLeave = function (event) {
                    HOVERED_CIRCLE = null;
                    dependencyLineLayer.removeChildren();
                    arrowheadLayer.removeChildren();
                }
            }

            function findAssignmentById(assignments, id) {
                for (var i = 0; i < assignments.length; i++) {
                    if (assignments[i].id == id) {
                        return assignments[i];
                    }
                }
            }

            function createDependencyLight(originalCircle) {
                lightLayer.activate();
                var dependencyLightCircle = new paper.Path.Circle(originalCircle.position, 50 * MapScaleService.scaleToDefault());

                DEPENDENTS.push(dependencyLightCircle);
                ORIGINALS.push(originalCircle);

                setDependencyLightStyle(dependencyLightCircle);
                dependencyLightCircle.fillColor.alpha = 0;
            }

            function setDependencyLightStyle(dependencyLightCircle) {
                dependencyLightCircle.style = {
                    strokeWidth: 0,
                    fillColor: '#F2D27E',
                    shadowColor: '#F2D27E',
                    shadowBlur: 15,
                    shadowOffset: [0, 0]
                };
            }

            function createDependencyArrow(startingPoint, endCircle) {
                dependencyLineLayer.activate();
                var path = new paper.Path();
                path.add(startingPoint);
                path.strokeWidth = 10 * MapScaleService.scaleToDefault();
                path.strokeColor = '#F2D27E';
                path.shadowColor = 'black';
                path.shadowOffset = [5, 5];

                createArrowhead(startingPoint, endCircle, 15 * MapScaleService.scaleToDefault());
            }

            function createArrowhead(startsAt, endCircle, size) {
                //activate arrowheadLayer and create a triangle with the given color
                arrowheadLayer.activate();
                var numberOfSides = 3;
                var triangle = new paper.Path.RegularPolygon(startsAt, numberOfSides, size);
                triangle.fillColor = '#F2D27E';

                rotateArrowhead(triangle, startsAt, endCircle);
            }

            function rotateArrowhead(arrowhead, start, endCircle) {
                //calculate the angle the arrowhead needs to be rotate to point at the edge of it's goal circle
                var edge = getCircleEdge(endCircle, start);
                var angle = Math.atan2(edge.y - start.y, edge.x - start.x);
                angle = angle * (180 / Math.PI);

                //set the pivot and rotate the arrowhead
                arrowhead.pivot = start;
                arrowhead.rotate(90 + angle);
            }

            //sets assignment colors (done/undone) according to what the current user has completed
            function changeAssignmentColors() {
                setAllUndone();
                for (var i = 0; i < scope.doneAssignments.length; i++) {
                    //scope.doneAssignments stores locations with an assumed map width of 1100
                    var relativeX = MapScaleService.getRelativeXFromDefaultSize(scope.doneAssignments[i].location.x);
                    var assignmentCircle = assignmentLayer.hitTest([relativeX, scope.doneAssignments[i].location.y]).item;
                    if (assignmentCircle) {
                        assignmentCircle.fillColor = getDoneFillColor(assignmentCircle);
                    }
                }
            }

            //sets all assignment circles to have color of an undone assignment
            function setAllUndone() {
                var locations = getLocations();
                for (var i = 0; i < locations.length; i++) {
                    //scope.assignments stores locations with an assumed map width of 1100
                    var relativeX = MapScaleService.getRelativeXFromDefaultSize(locations[i][0]);
                    var assignmentCircle = assignmentLayer.hitTest([relativeX, locations[i][1]]).item;
                    assignmentCircle.fillColor = getUndoneFillColor(assignmentCircle);
                }
            }

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
        }
    }
})