ProgressApp.directive('paperjsmap2', function () {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            assignments: '=',
            students: '='
        },
        link: function (scope, element, attrs) {
            var intervalLength = 5000;
            var minSpeed = 90;

            var speedUps = 0;

            var lastWaitTime = 0;

            var movingQueue = [];
            var movingInterval;

            var mapInitialized = false;
            var maxStudentsToShowAroundAssignment = 5;
            var maxStudentsInRow = 3;

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
                    placeNewStudentsOnMapWhichWerentThereYetButNowShouldBe();

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

                    assignment.latestDoers[j]['location'] = {'x': studentLocation.x, 'y': studentLocation.y };

                    studentCircle.fillColor = colorOfCircleOfStudent(assignment.latestDoers[j]);

                     //student id:s over student circles
                    var text = new paper.PointText({
                        point: new paper.Point(location.x + lateralPositionOffset - 20, location.y + verticalPositionOffset - 20),
                        content: assignment.latestDoers[j].id,
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

             function placeNewStudentsOnMapWhichWerentThereYetButNowShouldBe() {

                for (var i = 0; i < scope.students.length; i++) {
                    var student = scope.students[i];
                    var lastDoneAssignment = student.lastDoneAssignment;

                    if (lastDoneAssignment) {
                        var assignmentToMoveTo = scope.assignments[lastDoneAssignment.number - 1];

                        if (! originalAssignment(student) /* undefined if not shown anywhere in map */ &&
                            studentShouldBeInLatestDoersOfAssignment(student, assignmentToMoveTo)) {

                            putStudentToLatestDoersOfAssignment(student, assignmentToMoveTo);
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
                        var assignmentToMoveTo = scope.assignments[lastDoneAssignment.number - 1];                    
                        var original = originalAssignment(student); // undefined if not shown anywhere in map

                        if (original &&
                            original != assignmentToMoveTo &&
                            ! studentIsInLatestDoersOfAssignment(student, assignmentToMoveTo) &&
                            studentShouldBeInLatestDoersOfAssignment(student, assignmentToMoveTo)) {

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

                    var assignmentToMoveTo = scope.assignments[lastDoneAssignment.number - 1];

                    placeStudentToWait(student, originalAssignment(student), assignmentToMoveTo, students.length)
                }

                lastWaitTime = 0;
            }

            function placeStudentToWait(student, originalAssignment, assignmentToMoveTo, movingStudentsDuringInterval) {
                var time = waitingTime(movingStudentsDuringInterval);

                var waitTillMove = setTimeout(function() {
                                placeStudentInMovingQueue(student, originalAssignment, assignmentToMoveTo);
                                resetMovingInterval();

                                clearTimeout(waitTillMove);
                            }, time);

                lastWaitTime = time;
            }

            function waitingTime(movingStudentsDuringInterval) {
                return lastWaitTime + intervalLength * Math.random() / movingStudentsDuringInterval;
            }

            function placeStudentInMovingQueue(student, originalAssignment, assignmentToMoveTo) {
                var circleToMove = getStudentCircle(student, originalAssignment);

                var movingInfo = {'circle': circleToMove,
                                  'assignmentToMoveTo': assignmentToMoveTo,
                                  'originalAssignment': originalAssignment,
                                  'startPosition': circleToMove.position,
                                  'student': student,
                                  'speed': minSpeed }; // vakionopeus alussa kaikilla sama

                                  movingQueue.push(movingInfo);
            }

            function getStudentCircle(student, assignment) {
                var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
                return getItem(assignment.latestDoers[i].location);  // huono ratkaisu, voi johtaa ongelmiin... toisaalta Paper -kamaa ei voi tallettaa hashiin, koska herjaa konsolissa ja ohjelma ei toimi myöskään oikein...
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
                    var assignmentToMoveTo = elem.assignmentToMoveTo;
                    var startPosition = elem.startPosition;

                    if (hasReachedDestination(circleToMove, assignmentToMoveTo)) {
                        var student = elem.student;
                        var originalAssignment = elem.originalAssignment;

                        removeStudentFromLatestDoersOfAssignment(student, originalAssignment, startPosition);
                        putStudentToLatestDoersOfAssignment(student, assignmentToMoveTo);

                        circleToMove.remove(); // tuhoa tämä liikutettu versio, joka jäi tehtävänappulan päälle. uusi samanlainen on ylläolevassa funktiossa sijoitettu paikalleen.
                        paper.view.update();
                    }

                    else {
                        var newSpeed = moveCircle(circleToMove, assignmentToMoveTo, startPosition, elem.speed);
                        elem.circle = circleToMove;
                        elem.speed = newSpeed;

                        movingQueue.push(elem);
                    }
                }, 1000 / (60 * movingQueue.length))
            }

            function hasReachedDestination(circle, assignment) {
                var vector = getVector(circle, assignment);
                return Math.abs(vector[0]) + Math.abs(vector[1]) < 5;
            }

            function getVector(circle, assignment) {
                var position = circle.position;
                var destination = assignment.location;

                return [destination.x - position.x, destination.y - position.y];
            }

            function moveCircle(circle, assignment, startPosition, speed) {
                var vector = getVector(circle, assignment);
                var totalDistance = distanceBetweenPointAndAssignment(circle.position, assignment);
                var distanceRemaining = distanceBetweenPointAndAssignment(circle.position, assignment);

                circle.position.x += vector[0] / speed;
                circle.position.y += vector[1] / speed;

                if (distanceRemaining * 7 > totalDistance) {   // etäisyys yli 1/7 kokonaismatkasta kohteeseen
                    speed -= 0.5;                              // nopeus kasvaa "smoothisti"
                }
                else {
                    speed += 0.1;                              // nopeus alkaa laskemaan "smoothisti"
                }

                paper.view.update();

                speed = Math.max(10, speed);                   // nopeus tulee olla 10+ ja 100-
                return Math.min(speed, minSpeed);
            }

            function distanceBetweenPointAndAssignment(position, assignment) {
                return distance([position.x, position.y], [assignment.location.x, assignment.location.y]);
            }

            function removeStudentFromLatestDoersOfAssignment(student, assignment, position) {
                var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
                assignment.latestDoers.splice(i, 1);

                var student = studentToAddInPlaceOfRemovedOne(assignment);

                if (student) {
                    putStudentToLatestDoersOfAssignmentInPosition(student, assignment, position);
                }
            }

            function studentToAddInPlaceOfRemovedOne(assignment) {
                var studentToAdd = null;

                for (var i = 0; i < scope.students.length; i++) {
                    var student = scope.students[i];

                    if (student.lastDoneAssignment &&
                        student.lastDoneAssignment.number == assignment.number &&
                        ! studentIsInLatestDoersOfAssignment(student, assignment)) {

                        if (! studentToAdd) {
                            studentToAdd = student;
                        }

                        else if (firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student, studentToAdd)) {
                            studentToAdd = student;
                        }
                    }
                }

                return studentToAdd;
            }

            function putStudentToLatestDoersOfAssignmentInPosition(student, assignment, position) {
                assignment.latestDoers.push(student);
                assignment.latestDoers[assignment.latestDoers.length - 1]['location'] = {'x': position.x, 'y': position.y };

                var circle = new paper.Path.Circle(new paper.Point(position.x, position.y), 15); // luo circle studentToAddille
                circle.fillColor = colorOfCircleOfStudent(student);

                paper.view.update();
            }

            function putStudentToLatestDoersOfAssignment(student, assignment) {
                var position;

                if (assignment.latestDoers.length < maxStudentsToShowAroundAssignment) {
                    position = positionOfNewStudentAroundAssignment(assignment);
                }

                else { // remove an existing one and get its position
                    var studentToGo = studentToRemoveFromLatestDoersOfAssignment(assignment);
                    var i = indexOfStudentInLatestDoersOfAssignment(studentToGo, assignment);

                    position = assignment.latestDoers[i].location;
                    removeItemFromPosition(position);

                    assignment.latestDoers.splice(i, 1);
                }

                putStudentToLatestDoersOfAssignmentInPosition(student, assignment, position);
            }

            function studentToRemoveFromLatestDoersOfAssignment(assignment) {
                var studentToGo = assignment.latestDoers[0];

                for (var i = 1; i < assignment.latestDoers.length; i++) {
                    var next = assignment.latestDoers[i];

                    if (next && firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(studentToGo, next)) {
                        studentToGo = next;
                    }
                }
                return studentToGo;
            }

            function removeItemFromPosition(position) {
                var item = getItem(position);

                if (item) {
                    item.remove();
                    paper.view.update();
                }
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

            function originalAssignment(student) {
                for (var i = 0; i < scope.assignments.length; i++) {
                    var assignment = scope.assignments[i];

                    for (var j = 0; j < assignment.latestDoers.length; j++) {

                        if (studentIsInLatestDoersOfAssignment(student, assignment)) {
                            return assignment;
                        }
                    }
                }
                return undefined;
            }

            function studentIsInLatestDoersOfAssignment(student, assignment) {
                return indexOfStudentInLatestDoersOfAssignment(student, assignment) >= 0;
            }

            function indexOfStudentInLatestDoersOfAssignment(student, assignment) {
                for (var i = 0; i < assignment.latestDoers.length; i++) {

                    if (student.id == assignment.latestDoers[i].id) {
                        return i;
                    }
                }
                return -1;
            }

            function studentShouldBeInLatestDoersOfAssignment(student, assignment) {    // when called, we know that lastDoneAssignment of student is 'assignment'
                if (student.lastDoneAssignment) {

                    if (assignment.latestDoers.length < maxStudentsToShowAroundAssignment) {
                        return true;
                    }

                    for (var i = 0; i < assignment.latestDoers.length; i++) {
                        if (firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student, assignment.latestDoers[i])) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student1, student2) {
                return new Date(student1.lastDoneAssignment.timestamp) - new Date(student2.lastDoneAssignment.timestamp) > 0;
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