ProgressApp.controller('NewCourseController', function ($scope, $location, httpService, CanvasService, AssignmentDependenciesService) {

    $scope.assignments = [];
    $scope.students = [];

    httpService.getData('/students/all', {}).then(function (data) {
        $scope.allStudents = data['students']
    })

    $scope.createCourse = function () {

        var newCourse = {
            name: $scope.name,
            students: $scope.students,
            assignments: $scope.assignments
        }

        httpService.postData('/courses', newCourse).then(function (data) {
            var path = "/map/" + data.id
            $location.path(path)
        })
    }

    $scope.removeStudent = function (student) {
        editLists($scope.students, $scope.allStudents, student)
    }

    $scope.addStudent = function (newStudent) {
        editLists($scope.allStudents, $scope.students, newStudent)
    }

    function editLists(listToRemoveFrom, listToAddTo, member){
        var index = listToRemoveFrom.indexOf(member);
        listToRemoveFrom.splice(index, 1);
        listToAddTo.push(member);
    }

    $scope.showDependencies = function (assignment) {
        AssignmentDependenciesService.showDependencies(assignment, $scope.assignments);
    }

    $scope.hideDependencies = function (assignment) {
        AssignmentDependenciesService.hideDependencies(assignment, $scope.assignments);
    }

    $scope.placeAssignmentButtonsOnCanvas = function () {
        $scope.assignments = [];
        removeOriginalCanvas();

        var shuffleButtonStyle = 'none';

        if ($scope.assignmentCount) {
            shuffleButtonStyle = 'inline';

            CanvasService.initiateCanvas('canvas', $scope.assignmentCount, 1000, document.getElementById("mapElements"));

            var location = null;
            var locations = [];
            for (var i = 0; i < $scope.assignmentCount; i++) {
                location = CanvasService.drawLocationForAssignment(i, locations);
                locations.push(location);

                var assignment = {'number': i + 1, 'location': location, 'dependencies': [] };
                $scope.assignments.push(assignment);
            }
            CanvasService.drawSmoothPaths($scope.assignments);
        }

        $("#shuffle-button").css('display', shuffleButtonStyle);
    }

    function removeOriginalCanvas() {
        var canvasArray = document.getElementsByTagName("canvas");

        if (canvasArray && canvasArray[0]) {
            canvasArray[0].remove();
        }
    }
})