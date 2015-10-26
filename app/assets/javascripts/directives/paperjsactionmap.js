ProgressApp.directive('paperjsmap2', function () {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            assignments: '=',
            students: '='
        },
        link: function (scope, element, attrs) {

            //var studentOnTheMove = false;
            //var studentMoving;
            //var end;

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
                    drawSmoothPaperPaths();
                    placeCirclesOnAssignmentLocations();
                    placeLatestStudents();
                    paper.view.update();

                    mapInitialized = true;
                }
            }, true);

            scope.$watch('students', function (newval, oldval) {
                if (newval && mapInitialized) {
                    initializeLatest();
                    paper.view.update();
                }
            }, true);

            function placeLatestStudents() {
                var verticalPositionOffset = 0;
                var lateralPositionOffset = 50;

                for (var i = 0; i < scope.assignments.length; i++) {
                    var location = scope.assignments[i].location;
                    for (var j = 0; j < scope.assignments[i].latestDoers.length; j++) {
                        var studentLocation = new paper.Point(location.x + lateralPositionOffset, location.y + verticalPositionOffset);
                        var studentCircle = new paper.Path.Circle(studentLocation, 15);
                        studentCircle.fillColor = 'grey';

                        //student id:s over student circles
                        var text = new paper.PointText({
                            point: new paper.Point(location.x + lateralPositionOffset - 20, location.y + verticalPositionOffset - 20),
                            content: scope.assignments[i].latestDoers[j].id,
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
                    var verticalPositionOffset = 0;
                }
            }

            function placeCirclesOnAssignmentLocations() {
                var locations = getLocations();

                for (var i = 0; i < locations.length; i++) {
                    var assignmentCircle = new paper.Path.Circle(locations[i], 25);
                    assignmentCircle.fillColor = 'blue';

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

            /*paper.view.onFrame = function(event) {
                if (studentOnTheMove){

                    var vector = new paper.Point(end) - studentMoving.position;
                    if (event.count <= 10){
                        console.log("vector: " + vector);
                        console.log(new paper.Point(end));
                        console.log(studentMoving.position);
                    }
                    studentMoving.position += vector / 30;
                    if (studentMoving.position == end){
                        studentOnTheMove = false;
                    }
                    paper.view.update();
                }

            } */

            /* tool.onMouseDown = function (event) {
             path = new paper.Path();
             path.strokeColor = 'black';
             };
             tool.onMouseDrag = function (event) {
             path.add(event.point);
             };
             tool.onMouseUp = function (event) {
             //nothing special here
             };*/


            function initializeLatest() {
                for (var i = 0; i < scope.students.length; i++) {
                    var student = scope.students[i];
                    var lastDoneAssignment = student.lastDoneAssignment;

                    if (lastDoneAssignment) {
                        var assignmentToMoveTo = scope.assignments[lastDoneAssignment.number - 1];
                        var originalPositionForStudent = studentShownInMap(student);

                        if (assignmentToMoveTo != originalPositionForStudent &&
                            indexOfStudentInLatestDoersOfAssignment(student, assignmentToMoveTo) < 0 &&
                            studentShouldBeInLatestDoersOfAssignment(student, assignmentToMoveTo)) {

                            if (originalPositionForStudent) {
                                var circleToMove = getStudentCircle(student, originalPositionForStudent);

                                while (! hasReachedDestination(circleToMove, assignmentToMoveTo)) {
                                    sleep(1000 / 60);
                                    moveCircle(circleToMove, assignmentToMoveTo);
                                }

                                removeStudentFromPreviousAssignment(student, originalPositionForStudent);
                                addNewStudentInThePlaceOfRemovedOneIfSuchExists(originalPositionForStudent);
                            }

                            replaceLastShownStudentOfAssignmentWithStudent(assignmentToMoveTo, student);
                        }
                    }
                }
            }

            function moveCircle(circle, assignment) {
                var vector = getVector(circle, assignment);

                console.log("Position:" + circle.position);

                circle.position.x += vector[0] / 30;
                circle.position.y += vector[1] / 30;

                paper.view.update(true);    // forces updates to view but there are no changes?
            }

            function hasReachedDestination(circle, assignment) {
                var vector = getVector(circle, assignment);

                console.log("Vector x:" + vector[0])
                console.log("Vector y:" + vector[1])

                return Math.abs(vector[0]) + Math.abs(vector[1]) < 5;
            }

            function getVector(circle, assignment) {
                var position = circle.position;
                var destination = assignment.location;

                return [destination.x - position.x, destination.y - position.y];                
            }

            function sleep(milliseconds) {
                var start = new Date().getTime();
        
                for (var i = 0; i < 1e7; i++) {
                    if ((new Date().getTime() - start) > milliseconds) {
                        break;
                    }
                }
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

            function studentShownInMap(student) {
                for (var i = 0; i < scope.assignments.length; i++) {

                    for (var j = 0; j < scope.assignments[i].latestDoers.length; j++) {

                        if (indexOfStudentInLatestDoersOfAssignment(student, scope.assignments[i]) >= 0) {
                            return scope.assignments[i];
                        }
                    }
                }
                return null;
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