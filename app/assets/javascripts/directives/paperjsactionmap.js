ProgressApp.directive('paperjsmap2', function () {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            assignments: '=',
            students: '='
        },
        link: function (scope, element, attrs) {
            var intervalLength = 15000;

            var lastWaitTime = 0;
            var waitingQueue = [];

            var movingQueue = [];
            var movingInterval;

            resetMovingInterval();

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
            paper.install(window);
            paper.setup(element[0]);

            scope.$watch('assignments', function (newval, oldval) {
                if (newval && ! mapInitialized) {
                    setCanvasSize();
                    drawSmoothPaperPaths();
                    placeCirclesOnAssignmentLocations();
                    placeLatestStudents();

                    mapInitialized = true;
                    paper.view.onResize();
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

            paper.view.onResize = function(event) {
                setCanvasSize();
            }

            function setCanvasSize(){
                //var width = 1000 + 100; // 50 pikseliä lisää reunoja varten
                var width = window.innerWidth;

                var canvas = element[0];

                var borderSize = width / 40; // 25
                var blockSize = width / 5; // 200
                var assignmentsPerLevel = width / (2 * borderSize + blockSize) // 4, kuinka monta tehtävää on per taso
                var levelAmount = Math.ceil(scope.assignments.length / assignmentsPerLevel) // kuinka paljon tasoja tarvitaan

                var height = (2 * borderSize + blockSize) * levelAmount + 100;

                canvas.height = height;
                canvas.width = width;

                paper.view.viewSize = new paper.Size(width, height);
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
                    studentCircle.fillColor = 'grey';

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
                    //moving on to latest doers of next assignment
                lateralPositionOffset = 50;
                verticalPositionOffset = 0;
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
                path = new paper.Path();

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

             function placeNewStudentsOnMapWhichWerentThereYetButNowShouldBe() {

                for (var i = 0; i < scope.students.length; i++) {
                    var student = scope.students[i];
                    var lastDoneAssignment = student.lastDoneAssignment;

                    if (lastDoneAssignment) {
                        var assignmentToMoveTo = scope.assignments[lastDoneAssignment.number - 1];
                        var original = originalAssignment(student); // undefined if not shown anywhere in map

                        if (! original &&
                            ! studentIsInLatestDoersOfAssignment(student, assignmentToMoveTo) &&
                            studentShouldBeInLatestDoersOfAssignment(student, assignmentToMoveTo)) {

                            replaceLastShownStudentOfAssignmentWithStudent(assignmentToMoveTo, student);
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
                    var original = originalAssignment(student); // always defined here since all these students move

                    // no reason to compare anything here since the students moves from their original position to assignmentToMoveTo

                    placeStudentInWaitingQueue(student, original, assignmentToMoveTo, students.length)
                }

                lastWaitTime = 0;
            }

            function placeStudentInWaitingQueue(student, originalAssignment, assignmentToMoveTo, movingStudentsDuringInterval) {
                var time = timeToWaitInQueue(movingStudentsDuringInterval);

                var wait = setTimeout(function() {
                                placeStudentInMovingQueue(student, originalAssignment, assignmentToMoveTo);
                                resetMovingInterval();

                                clearTimeout(wait);
                            }, time);

                waitingQueue.push(wait);

                lastWaitTime = time;
            }

            function timeToWaitInQueue(movingStudentsDuringInterval) {
                return lastWaitTime + intervalLength * Math.random() / movingStudentsDuringInterval;
            }

            function placeStudentInMovingQueue(student, originalAssignment, assignmentToMoveTo) {
                waitingQueue.shift(); // poista odotusjonosta. pitäisi olla aina ekana jonossa.

                var circleToMove = getStudentCircle(student, originalAssignment);

                var movingInfo = {'circle': getStudentCircle(student, originalAssignment),
                                  'assignmentToMoveTo': assignmentToMoveTo,
                                  'originalAssignment': originalAssignment,
                                  'startPosition': circleToMove.position,
                                  'student': student};

                movingQueue.push(movingInfo);
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

                    if (hasReachedDestination(circleToMove, assignmentToMoveTo)) {
                        var student = elem.student;
                        var originalAssignment = elem.originalAssignment;

                        removeStudentFromPreviousAssignment(student, originalAssignment);
                        addNewStudentInThePlaceOfRemovedOneIfSuchExists(originalAssignment);

                        replaceLastShownStudentOfAssignmentWithStudent(assignmentToMoveTo, student);

                        console.log("waiting queue: " + waitingQueue)
                        console.log("moving queue: " + movingQueue)
                    }

                    else {
                        var startPosition = elem.startPosition;

                        moveCircle(circleToMove, assignmentToMoveTo, startPosition);
                        elem.circle = circleToMove;

                        movingQueue.push(elem);
                    }
                }, 1000 / (60 * movingQueue.length))
            }

            function moveCircle(circle, assignment, startPosition) {
                var vector = getVector(circle, assignment);

                // sen sijaan että liikutettaisiin aina vector / 40 eteenpäin, nopeus voisi määräytyä kuljetusta matkasta ja etäisyydestä sekä assignmentiin ja startPositioniin?

                circle.position.x += vector[0] / 40;
                circle.position.y += vector[1] / 40;

                // poista vanha lokaatio?

                paper.view.update();
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

            function getStudentCircle(student, assignment) {
                var yOffset = 0;

                var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);

                while (i >= maxStudentsInRow) {
                    yOffset += 30;
                    i -= maxStudentsInRow;
                }
                var xOffset = 50 + i * 30;

                var location = [assignment.location.x + xOffset, assignment.location.y + yOffset];
                return paper.project.hitTest(location).item;
            }


            function removeStudentFromPreviousAssignment(student, assignment) {
                var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
                assignment.latestDoers.splice(i, 1);

                // siirrä muut pisteet yhden paikan taaksepäin
            }

            function addNewStudentInThePlaceOfRemovedOneIfSuchExists(assignment) {
                var studentToAdd = null;

                for (var i = 0; i < scope.students.length; i++) {
                    var student = scope.students[i];

                    if (student.lastDoneAssignment &&
                        student.lastDoneAssignment.number == assignment.number &&
                        indexOfStudentInLatestDoersOfAssignment(student, assignment) < 0) {

                        if (!studentToAdd) {
                            studentToAdd = student;
                        }

                        else if (student1HasDoneLastDoneAssignmentAfterStudent2(studentToAdd, student)) {
                            studentToAdd = student;
                        }
                    }
                }

                if (studentToAdd) {
                    assignment.latestDoers.push(studentToAdd);
                    sortLatestDoersForAssignment(assignment);
                }
            }

            function replaceLastShownStudentOfAssignmentWithStudent(assignment, student) {
                if (assignment.latestDoers.length == maxStudentsToShowAroundAssignment) {
                    assignment.latestDoers.pop();
                }

                assignment.latestDoers.push(student);
                sortLatestDoersForAssignment(assignment);
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
                        if (student1HasDoneLastDoneAssignmentAfterStudent2(student, assignment.latestDoers[i])) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function sortLatestDoersForAssignment(assignment) {
                assignment.latestDoers.sort(function (a, b) {
                    return new Date(b.lastDoneAssignment.timestamp) - new Date(a.lastDoneAssignment.timestamp);
                })
            }

            function student1HasDoneLastDoneAssignmentAfterStudent2(student1, student2) {
                return new Date(student1.lastDoneAssignment.timestamp) - new Date(student2.lastDoneAssignment.timestamp) > 0;
            }
        }
    }
})