ProgressApp.directive('paperjsmap2', function (AssignmentLatestDoersService) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            assignments: '=',
            students: '='
        },
        link: function (scope, element, attrs) {
            var mapInitialized = false;

            var maxStudentsToShowAroundAssignment = 5;
            var maxStudentsInRow = 3;

            var movingQueue = [];
            var movingInterval;
            var lastWaitTime = 0;
            var intervalLength = 5000;
            var minSpeed = 90;

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
                if (newval && ! mapInitialized) {
                    setCanvasSize();
                    drawSmoothPaperPaths();
                    placeCirclesOnAssignmentLocations();
                    placeLatestStudents();
                    paper.view.update();

                    mapInitialized = true;
                }
            }, true);

            scope.$watch('students', function (newval, oldval) {
                if (newval && mapInitialized) {
                    placeNewStudentsOnMapWhichAreNotThereYetButNowShouldBe();

                    var students = getMovingStudents();
                    moveStudents(students);

                    paper.view.update();
                }
            }, true);

            function setCanvasSize() {
                //to be changed according to window size?
                var width = 1000 + 100; // 50 pikseliä lisää reunoja varten

                var canvas = element[0];

                var borderSize = width / 40; // 25
                var blockSize = width / 5; // 200
                var assignmentsPerLevel = width / (2 * borderSize + blockSize) // 4, kuinka monta tehtävää on per taso
                var levelAmount = Math.ceil(scope.assignments.length / assignmentsPerLevel) // kuinka paljon tasoja tarvitaan

                var height = (2 * borderSize + blockSize) * levelAmount + 100;

                canvas.height = height;
                canvas.width = width;

                paper.view.viewSize = new paper.Size(width, height); // kun käytössä, niin piirtää ainakin oman koneen selaimilla canvaksen zoomattuna -Mika
                paper.view.draw();
            }

            function placeLatestStudents() {
                for (var i = 0; i < scope.assignments.length; i++) {
                    placeStudentCirclesForAssignment(scope.assignments[i]);
                }
            }

            function placeStudentCirclesForAssignment(assignment) {
                var verticalPositionOffset = 0;
                var lateralPositionOffset = 50;
                var location = assignment.location;

                for (var j = 0; j < assignment.latestDoers.length; j++) {
                    var studentLocation = new paper.Point(location.x + lateralPositionOffset, location.y + verticalPositionOffset);
                    var studentCircle = new paper.Path.Circle(studentLocation, 15);
                    var student = assignment.latestDoers[j];

                    AssignmentLatestDoersService.setLocationOfStudent(student, studentLocation.x, studentLocation.y );

                    studentCircle.fillColor = colorOfCircleOfStudent(student);

                     //student id:s over student circles
                    var text = new paper.PointText({
                        point: new paper.Point(location.x + lateralPositionOffset - 20, location.y + verticalPositionOffset - 20),
                        content: student.id,
                        fillColor: 'white'
                    });

                    lateralPositionOffset += 30;

                    if ((j + 1) % maxStudentsInRow == 0) {
                        verticalPositionOffset += 30;
                        lateralPositionOffset = 50;
                    }
                }
            }

            function placeCirclesOnAssignmentLocations() {
                var locations = getLocations();

                for (var i = 0; i < locations.length; i++) {
                    var assignmentCircle = new paper.Path.Circle(locations[i], 25);
                    assignmentCircle.fillColor = '#29C124';
                    assignmentCircle.fillColor.hue -= 100 - (scope.assignments[i].doers.length/scope.students.length * 100);

                    //assignment numbers over assignment circles
                    var text = new paper.PointText({
                        point: locations[i],
                        content: i + 1,
                        fillColor: 'white'
                    });
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


             /* tool.onMouseHover = function (event) {
                functionality for showing dependencies
             }; */

             function placeNewStudentsOnMapWhichAreNotThereYetButNowShouldBe() {

                for (var i = 0; i < scope.students.length; i++) {
                    var student = scope.students[i];
                    var lastDoneAssignment = student.lastDoneAssignment;

                    if (lastDoneAssignment) {
                        var destinationAssignment = scope.assignments[lastDoneAssignment.number - 1];

                        if (! AssignmentLatestDoersService.originalAssignment(student, scope.assignments) &&
                            AssignmentLatestDoersService.studentShouldBeInLatestDoersOfAssignment(student, destinationAssignment)) {

                            putStudentToLatestDoersOfAssignment(student, destinationAssignment, endPosition(destinationAssignment));
                        }
                    }
                }
             }

            function getMovingStudents() {
                var movingStudents = [];

                for (var i = 0; i < scope.students.length; i++) {
                    var student = scope.students[i];
                    var lastDoneAssignment = student.lastDoneAssignment;

                    if (lastDoneAssignment) {
                        var destinationAssignment = scope.assignments[lastDoneAssignment.number - 1];
                        var originalAssignment = AssignmentLatestDoersService.originalAssignment(student, scope.assignments); // undefined if not shown anywhere in map

                        if (originalAssignment &&
                            originalAssignment != destinationAssignment &&
                            ! AssignmentLatestDoersService.studentIsInLatestDoersOfAssignment(student, destinationAssignment) &&
                            AssignmentLatestDoersService.studentShouldBeInLatestDoersOfAssignment(student, destinationAssignment)) {

                            movingStudents.push(student);
                        }
                    }
                }
                return movingStudents;
            }

            function moveStudents(students) {
                for (var i = 0; i < students.length; i++) {
                    var student = students[i];
                    var lastDoneAssignment = student.lastDoneAssignment;
                    var originalAssignment = AssignmentLatestDoersService.originalAssignment(student, scope.assignments);
                    var destinationAssignment = scope.assignments[lastDoneAssignment.number - 1];

                    placeStudentToWait(student, originalAssignment, destinationAssignment, students.length);
                }

                lastWaitTime = 0;
            }

            function placeStudentToWait(student, originalAssignment, destinationAssignment, movingStudentsDuringInterval) {
                var time = waitingTime(movingStudentsDuringInterval);

                var waitTillMove = setTimeout(function() {
                                placeStudentInMovingQueue(student, originalAssignment, destinationAssignment);
                                resetMovingInterval();

                                clearTimeout(waitTillMove);
                            }, time);

                lastWaitTime = time;
            }

            function waitingTime(movingStudentsDuringInterval) {
                return lastWaitTime + intervalLength * Math.random() / movingStudentsDuringInterval;
            }

            function placeStudentInMovingQueue(student, originalAssignment, destinationAssignment) {
                var circleToMove = getStudentCircle(student, originalAssignment);

                var movingInfo = {'circle': circleToMove,
                                  'originalAssignment': originalAssignment,
                                  'destinationAssignment': destinationAssignment,
                                  'startPosition': circleToMove.position,
                                  'endPosition': endPosition(destinationAssignment),
                                  'student': student,
                                  'speed': minSpeed }; // vakionopeus alussa kaikilla sama

                                  movingQueue.push(movingInfo);
            }

            function getStudentCircle(student, assignment) {
                var location = AssignmentLatestDoersService.getLocationOfStudent(student, assignment);
                return getItem(location); // huono ratkaisu, voi johtaa ongelmiin... toisaalta Paper -kamaa ei voi tallettaa hashiin, koska herjaa konsolissa ja ohjelma ei toimi myöskään oikein...
            }

            function getItem(location) {
                var hitTest = paper.project.hitTest(location);

                if (hitTest) {
                    return hitTest.item;
                }
                return null;
            }

            function resetMovingInterval() {
                if (movingInterval) {
                    clearInterval(movingInterval);
                }

                movingInterval = setInterval(function() {

                    if (movingQueue.length <= 0) {
                        return;
                    }

                    var elem = movingQueue.shift(); // pop from queue

                    var circleToMove = elem.circle;
                    var startPosition = elem.startPosition;
                    var endPosition = elem.endPosition;

                    if (hasReachedDestination(circleToMove, endPosition)) {
                        var student = elem.student;
                        var originalAssignment = elem.originalAssignment;

                        removeStudentFromLatestDoersOfAssignment(student, originalAssignment, startPosition);
                        putStudentToLatestDoersOfAssignment(student, elem.destinationAssignment, endPosition);

                        circleToMove.remove(); // tuhoa tämä liikutettu versio, joka jäi tehtävänappulan päälle. uusi samanlainen on ylläolevassa funktiossa sijoitettu paikalleen.
                        paper.view.update();
                    }

                    else {
                        var newSpeed = moveCircle(circleToMove, startPosition, endPosition, elem.speed);
                        elem.circle = circleToMove;
                        elem.speed = newSpeed;

                        movingQueue.push(elem);
                    }
                }, 1000 / (60 * movingQueue.length))
            }

            function hasReachedDestination(circle, destination) {
                var vector = getVector(circle, destination);
                return Math.abs(vector[0]) + Math.abs(vector[1]) < 1;
            }

            function getVector(circle, destination) {
                var position = circle.position;
                return [destination.x - position.x, destination.y - position.y];
            }

            function moveCircle(circle, startPosition, endPosition, speed) {
                var vector = getVector(circle, endPosition);
                var totalDistance = distanceBetweenPoints(startPosition, endPosition);
                var distanceRemaining = distanceBetweenPoints(circle.position, endPosition);

                circle.position.x += vector[0] / speed;
                circle.position.y += vector[1] / speed;

                if (distanceRemaining * 7 > totalDistance) {   // etäisyys yli 1/7 kokonaismatkasta kohteeseen
                    speed -= 0.5;                              // nopeus kasvaa "smoothisti"
                }

                else if (distanceRemaining * 20 > totalDistance) { // nopeus alkaa laskemaan "smoothisti"
                    speed += 0.1
                }
                else {
                    speed += 0.02 // speed laskee vain vähän kun ollaan alle 5% etäisyydellä kohteeseen
                }

                paper.view.update();

                speed = Math.max(10, speed);                   // nopeus tulee olla 10+ ja 100-
                return Math.min(speed, minSpeed);
            }

            function distanceBetweenPoints(point1, point2) {
                return distance([point1.x, point1.y], [point2.x, point2.y]);
            }

            function removeStudentFromLatestDoersOfAssignment(student, assignment, position) {
                AssignmentLatestDoersService.removeStudentFromLatestDoersOfAssignment(student, assignment);
                var student = AssignmentLatestDoersService.studentToAddInPlaceOfRemovedOne(assignment, scope.students);

                if (student) {
                    putStudentToLatestDoersOfAssignmentInPosition(student, assignment, position);
                }
            }

            function putStudentToLatestDoersOfAssignmentInPosition(student, assignment, position) {
                AssignmentLatestDoersService.addStudentToLatestDoersWithLocation(student, assignment, position);

                var circle = new paper.Path.Circle(new paper.Point(position.x, position.y), 15); // luo circle studentToAddille
                circle.fillColor = colorOfCircleOfStudent(student);

                paper.view.update();
            }

            function putStudentToLatestDoersOfAssignment(student, assignment, position) {
                if (AssignmentLatestDoersService.latestDoersFull(assignment)) {
                    AssignmentLatestDoersService.removeTheOldestStudentFromLatestDoers(assignment);
                    removeItemFromPosition(position);
                }

                putStudentToLatestDoersOfAssignmentInPosition(student, assignment, position);
            }

            function removeItemFromPosition(position) {
                var item = getItem(position);

                if (item) {
                    item.remove();
                    paper.view.update();
                }
            }

            function endPosition(assignment) {
                if (AssignmentLatestDoersService.latestDoersFull(assignment)) {
                    return AssignmentLatestDoersService.locationOfOldestStudentInLatestDoers(assignment);
                }

                return positionOfNewStudentAroundAssignment(assignment);
            }

            function positionOfNewStudentAroundAssignment(assignment) {
                var location = assignment.location;
                var lateralPositionOffset = 50;
                var verticalPositionOffset = 0;

                var position = {'x': location.x + lateralPositionOffset, 'y': location.y + verticalPositionOffset };

                for (var i = 0; i < assignment.latestDoers.length; i++) {

                    if (! getItem(position)) { // uusi positio välissä, josta circle siirtynyt aiemmin pois
                        return position;
                    }

                    lateralPositionOffset += 30;

                    if ((i + 1) % maxStudentsInRow == 0) {
                        verticalPositionOffset += 30;
                        lateralPositionOffset = 50;
                    }

                    position = {'x': location.x + lateralPositionOffset, 'y': location.y + verticalPositionOffset };
                }
                return position; // uusi positio perällä, yleisempi tapaus
            }

            function colorOfCircleOfStudent(student) { // ei tarvita kun käyttöön tulee imaget
                if (student.id % 3 == 0) {
                    return "#" + Math.round(55 + 200 * student.id / scope.students.length).toString(16) + "3737";
                }
                else if (student.id % 3 == 1) {
                    return "#37" + Math.round(55 + 200 * student.id / scope.students.length).toString(16) + "37";
                }

                return "#3737" + Math.round(55 + 200 * student.id / scope.students.length).toString(16);
            }    
        }
    }
})