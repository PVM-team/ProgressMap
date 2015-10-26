ProgressApp.controller('ActionMapController', function ($scope, $routeParams, $location, httpService, CanvasService, StateService) {

    var self = this;
    var maxStudentsToShowAroundAssignment = 5;

    var interval = setInterval(function() {
        self.updateLatestAssignments();
    }, 15000);

    httpService.getData('/map/action_init.json', { params: { course_id: $routeParams.course_id } }).then(function (data) {

        $scope.course = data["course"][0];
        $scope.assignments = data["assignments"];
        $scope.students = data["students"];

        //CanvasService.initiateCanvas($scope.assignments.length, 1000, document.getElementById("actionMapElements"), "rgba(30, 85, 205, 0.50");
        //CanvasService.drawSmoothPaths($scope.assignments);
        CanvasService.initiatePaperCanvas('canvas3', $scope.assignments.length, 1000);

        sortAssignmentsByNumber();
        assignLatestDoersForAssignments();
    })

    $scope.$on("$destroy", function() {
        clearInterval(interval);
    });

    $scope.goToNormalMap = function() {
        $location.path('/map/' + $scope.course.id);
    }

    this.updateLatestAssignments = function() {
        httpService.getData('/map/action_init.json', { params: { course_id: $routeParams.course_id } }).then(function (data) {
            $scope.students = data["students"];

            initializeLatest();
        })
    }

    function initializeLatest() {
        for (var i = 0; i < $scope.students.length; i++) {
            var student = $scope.students[i];
            var lastDoneAssignment = student.lastDoneAssignment;
            
            if (lastDoneAssignment) {
                var assignmentToMoveTo = $scope.assignments[lastDoneAssignment.number - 1];

                var originalPositionForStudent = studentShownInMap(student);


                if (! studentInLatestDoersOfAssignment(student, assignmentToMoveTo) &&
                    studentShouldBeInLatestDoersOfAssignment(student, assignmentToMoveTo)) {

                    if (studentShownInMap(student)) {
                        var originalPositionForStudent = studentShownInMap(student);

                        removeStudentFromLastShownStudentsOfAssignment(originalPositionForStudent, student);
                        addNewStudentInThePlaceOfRemovedOneIfSuchExists(originalPositionForStudent);
                    }

                    replaceLastShownStudentOfAssignmentWithStudent(assignmentToMoveTo, student);
                }
            }
        }
    }

    function removeStudentFromLastShownStudentsOfAssignment(assignment, student) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {
            if (student.id == assignment.latestDoers[i].id) {
                assignment.latestDoers.splice(i, 1);
            }
        }
    }

    function addNewStudentInThePlaceOfRemovedOneIfSuchExists(assignment) {
        var studentToAdd = null;

        for (var i = 0; i < $scope.students.length; i++) {
            var student = $scope.students[i];

            if (student.lastDoneAssignment &&
                student.lastDoneAssignment.number == assignment.number &&
                ! studentInLatestDoersOfAssignment(student, assignment)) {

                if (! studentToAdd) {
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
        for (var i = 0; i < $scope.assignments.length; i++) {

            for (var j = 0; j < $scope.assignments[i].latestDoers.length; j++) {

                if (studentInLatestDoersOfAssignment(student, $scope.assignments[i])) {
                    return $scope.assignments[i];
                }
            }
        }
        return null;
    }

    function studentInLatestDoersOfAssignment(student, assignment) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (student.id == assignment.latestDoers[i].id) {
                return true;
            }
        }
        return false;
    }

    function studentShouldBeInLatestDoersOfAssignment(student, assignment) {
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

    function sortAssignmentsByNumber() {
        $scope.assignments.sort(function (a, b) {
            return a.number - b.number;
        })
    }

    function assignLatestDoersForAssignments() {
        addLatestDoersArrayForEachAssignment();
        addEachStudentToLatestDoersOfAssignmentTheyBelong();
        sortLatestDoersForEachAssignment();
        removeStudentsFromLatestDoersIfThereAreTooMany();

    }

    function addLatestDoersArrayForEachAssignment() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            $scope.assignments[i]['latestDoers'] = [];
        }
    }

    function addEachStudentToLatestDoersOfAssignmentTheyBelong() {
         for (var i = 0; i < $scope.students.length; i++) {
            var student = $scope.students[i];

            if (student.lastDoneAssignment) {
                $scope.assignments[student.lastDoneAssignment.number - 1].latestDoers.push(student);
            }
        }
    }
    
    function removeStudentsFromLatestDoersIfThereAreTooMany() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            removeStudentsFromLatestDoersOfAssignmentIfThereAreTooMany($scope.assignments[i]);
        }
    }

    function removeStudentsFromLatestDoersOfAssignmentIfThereAreTooMany(assignment) {
        var doers = assignment.latestDoers;

        if (doers.length > maxStudentsToShowAroundAssignment) {
            //sortLatestDoersForAssignment(assignment);

            var new_doers = [];

            for (var j = 0; j < maxStudentsToShowAroundAssignment; j++) {
                new_doers.push(doers[j]);
            }
            assignment.latestDoers = new_doers;
        }
    }

    function sortLatestDoersForEachAssignment() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            sortLatestDoersForAssignment($scope.assignments[i]);
        }
    }

    function sortLatestDoersForAssignment(assignment) {
        assignment.latestDoers.sort(function (a, b) {
            return new Date(b.lastDoneAssignment.timestamp) - new Date(a.lastDoneAssignment.timestamp);
        })
    }

    function student1HasDoneLastDoneAssignmentAfterStudent2(student1, student2) {
        return new Date(student1.lastDoneAssignment.timestamp) - new Date(student2.lastDoneAssignment.timestamp) > 0;
    }

    $scope.locationOfStudentInMap = function(student, assignment) {
        var studentButtonWidth = 25;
        var studentButtonHeight = 25;
        var radius = 40;

        var step = 2 * Math.PI / assignment.latestDoers.length;
        var angle = 0;

        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (student.id == assignment.latestDoers[i].id) {
                var x = Math.round(assignment.location.x + radius * Math.cos(angle) - studentButtonWidth / 2);
                var y = Math.round(assignment.location.y + radius * Math.sin(angle) - studentButtonHeight / 2);

                return { top: y + 'px', left: x + 'px' };
            }

            angle += step;
        }
    }
})
