ProgressApp.controller('EditCourseController', function($scope, $routeParams, $location, StateService, httpService, CanvasService, AssignmentDependenciesService) {

    $scope.mutex = false;

    httpService.getData('courses/show', { params: { course_id: $routeParams.course_id }}).then(function(data) {
        if (! validRequest(data)) {
            $location.path("/");
            return;
        }

        $scope.course = data['course'][0];
        $scope.assignments = data["assignments"];
        $scope.students = data["students"];

        $scope.name = $scope.course.name;

        for (var i = 0; i < $scope.assignments.length; i++) {
            var assignment = $scope.assignments[i];

            assignment['dependencyText'] = "";


            for (var j = 0; j < assignment.dependencies.length; j++) {

                assignment['dependencyText'] += assignment.dependencies[j].name;

                if (j < assignment.dependencies.length - 1) {
                    assignment['dependencyText'] += ",";
                }
            }
        }

        setDisplayOfNewAssignmentButton();

        CanvasService.initiateCanvas($scope.assignments.length, 1000, document.getElementById("mapElements"), "rgba(30, 85, 205, 0.50");
        CanvasService.drawSmoothPaths($scope.assignments);
    })

    $scope.changeDependenciesOfAssignment = function(assignment) {
        var index = $scope.assignments.indexOf(assignment);
        var dependencyList = parseDependencies(assignment);
        var data = {
            assignment_id: assignment.id,
            dependencies: dependencyList
        }

        httpService.putData('assignments/edit_dependencies', data).then(function(data) {
            $scope.assignments[index].dependencies = dependencyList;
        });
    }

    function parseDependencies(assignment) {
        var dependenciesNames = assignment.dependencyText.split(",");
        var dependencyList = [];
        for (var i = 0; i < dependenciesNames.length; i++) {
            for (var j = 0; j < $scope.assignments.length; j++) {
                if (dependenciesNames[i] == $scope.assignments[j].name) {
                    dependencyList.push($scope.assignments[j]);
                }
            }
        }
        return dependencyList;
    }

    $scope.givenNamesAreCorrect = function(assignment) {
        var dependenciesNames = assignment.dependencyText.split(",");
        var index = $scope.assignments.indexOf(assignment);
        for (var i = 0; i < dependenciesNames.length; i++) {
            var validName = false;
            for (var j = 0; j < $scope.assignments.length; j++) {
                if (dependenciesNames[i] == $scope.assignments[j].name && j != index) {
                    validName = true;
                }
            }
            if (!validName) {
                return false;
            }
        }
        return true;
    }

    $scope.changeNameOfAssignment = function(assignment) {
        var data = {
            assignment_id: assignment.id,
            name: assignment.name
        }
        httpService.putData('assignments/edit_name', data).then(function(data) {})
    }

    $scope.goToCoursePage = function() {
        $location.path("/map/" + $scope.course.id);
    }

    $scope.editCourseName = function() {
        var data = {
            course_id: $scope.course.id,
            name: $scope.name
        }

        httpService.putData('/courses/edit_name', data).then(function (data) {
            $scope.course.name = data['course'].name;
        })
    }

    $scope.showDependencies = function (assignment) {
        AssignmentDependenciesService.showDependencies(assignment, $scope.assignments);
    }

    $scope.hideDependencies = function (assignment) {
        AssignmentDependenciesService.hideDependencies(assignment, $scope.assignments);
    }

    $scope.addAssignment = function() {
        $scope.mutex = true;

        var previousLocation = locationOfLastAssignment();

        var location = CanvasService.locationOfNewAssignment($scope.assignments.length, previousLocation);

        var data = {
            course_id: $scope.course.id,
            number: $scope.assignments.length + 1,
            location: location,
            dependencies: []
        }

        httpService.postData('/assignments', data).then(function (data) {
            $scope.assignments.push(data['assignment'][0]);

            setDisplayOfNewAssignmentButton();

            if (CanvasService.lastLevelFull($scope.assignments.length - 1)) {
                moveAllLocationsDownByOneLevel();
            }

            else {
                reDrawCanvas();
                $scope.mutex = false;
            }
        })
    }

    $scope.deleteAssignment = function(assignment) {
        $scope.mutex = true;

        var number = assignment.number;
        var location = assignment.location;

        var index = $scope.assignments.indexOf(assignment);

        httpService.deleteData('assignments/' + assignment.id).then(function (data) {
            $scope.assignments.splice(index, 1);

            setDisplayOfNewAssignmentButton();

            decreaseNumbersOfFollowingAssignments(number, location);
        })
    }

    $scope.deleteStudent = function(student) {
        var index = $scope.students.indexOf(student);

        httpService.deleteData('students/' + student.id).then(function (data) {
            $scope.students.splice(index, 1);
        })
    }

    function validRequest(data) {
        return data['course'][0];
    }

    function locationOfLastAssignment() {
        for (var i = $scope.assignments.length - 1; i >= 0; i--) {
            if ($scope.assignments[i].number == $scope.assignments.length) {
                return $scope.assignments[i].location;
            }
        }
        return null;
    }

    function decreaseNumbersOfFollowingAssignments(number, location) {
        var data = {
            course_id: $scope.course.id,
            location: location,
            number: number
        }

        httpService.postData('assignments/decrease_numbers', data).then(function (data) {
            $scope.assignments = data['assignment'];

            if (CanvasService.lastLevelFull($scope.assignments.length)) {
                moveAllLocationsUpByOneLevel();
            }

            else {
                reDrawCanvas();
                $scope.mutex = false;
            }
        })
    }

    function moveAllLocationsUpByOneLevel() {
        moveAllLocationsToDirection("up");
    }

    function moveAllLocationsDownByOneLevel() {
        moveAllLocationsToDirection("down");
    }

    function moveAllLocationsToDirection(direction) {
        var move = CanvasService.levelHeight();

        if (direction === 'up') {
            move *= -1;
        }

        var data = {
            course_id: $scope.course.id,
            move: move
        }

        httpService.postData('locations/move', data).then(function (data) {
            $scope.assignments = data['assignment'];
            reDrawCanvas();

            $scope.mutex = false;
        })
    }

    function reDrawCanvas() {
        removeOriginalCanvas();

        CanvasService.initiateCanvas($scope.assignments.length, 1000, document.getElementById("mapElements"), "rgba(30, 85, 205, 0.50");
        CanvasService.drawSmoothPaths($scope.assignments);
    }

    function removeOriginalCanvas() {
        var canvasArray = document.getElementsByTagName("canvas");

        if (canvasArray && canvasArray[0]) {
            canvasArray[0].remove();
        }
    }

    function setDisplayOfNewAssignmentButton() {
        var style = 'inline';

        if ($scope.assignments.length >= 500) {
            style = 'none';
        }
        $("#add-assignment-btn").css('display', style);
    }
})
