ProgressApp.controller('NewCourseController', function($scope, $location, httpService, CanvasService, AssignmentDependenciesService) {
    $scope.showNavigation = true;
    $scope.buttonClicked = false;
    
    if (! $scope.currentUser) {
        $location.path("/");
    }

    $scope.assignments = [];

    $scope.createCourse = function () {
        $scope.buttonClicked = true;
        
        var teacher = $scope.currentUser;

        var newCourse = {
            name: $scope.name,
            assignments: $scope.assignments,
            teacherEmail: teacher.email
        }

        httpService.postData('/courses', newCourse).then(function (data) {
            $location.path("/course/" + data.id + "/edit");
        })
    }

    $scope.showDependencies = function (assignment) {
        //AssignmentDependenciesService.showDependencies(assignment, $scope.assignments);
    }

    $scope.hideDependencies = function (assignment) {
        //AssignmentDependenciesService.hideDependencies(assignment, $scope.assignments);
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
