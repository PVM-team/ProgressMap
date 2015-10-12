ProgressApp.controller('NewCourseController', function ($scope, $location, httpService, CanvasService, AssignmentDependenciesService) {

    $scope.assignments = []
    $scope.participants = []

    httpService.getData('/users/all', {}).then(function (data) {
        $scope.allUsers = data['users']
    })

    $scope.createCourse = function () {

        var newCourse = {
            name: $scope.name,
            participants: $scope.participants,
            assignments: $scope.assignments
        }

        httpService.postData('/courses', newCourse).then(function (data) {
            var path = "/map/" + data.id
            $location.path(path)
        })
    }

    $scope.removeParticipant = function (participant) {
        editLists($scope.participants, $scope.allUsers, participant)
    }

    $scope.addParticipant = function (newParticipant) {
        editLists($scope.allUsers, $scope.participants, newParticipant)
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

            CanvasService.initiateCanvas($scope.assignmentCount, 1000, document.getElementById("mapElements"), "rgba(30, 85, 205, 0.50");

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