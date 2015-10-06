ProgressApp.controller('actionMapController', function ($scope, $routeParams, $location, httpService, CanvasService, StateService) {
    $scope.studentsOnMap;
    var assignmentCount = []


    httpService.getData('/map/init.json', {
        params: {
            course_id: $routeParams.course_id,
        }
    }).then(function (data) {

        $scope.course = data["course"][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]

        var assignmentLocations = getLocations();
        CanvasService.initiateCanvas(1000, 1000, document.getElementById("actionMapElements"), "rgba(30, 85, 205, 0.50");

        CanvasService.drawSmoothPaths(assignmentLocations);
        placeStudents();
    })

    $scope.goToNormalMap = function() {
        $location.path('/map/' + $scope.course.id)
    }

    function placeStudents() {
        var students = [];
        for (var i = 0; i < $scope.assignments.length + 1; i++){
            assignmentCount.push(0);
        }
        for (var i = 0; i < $scope.participants.length; i++) {
            var lastAssignmentDone = getLatestAssignment($scope.participants[i]);
            if (lastAssignmentDone){
                assignmentCount[lastAssignmentDone.number] += 1;

                var x = lastAssignmentDone.location.x + 25 * (assignmentCount[lastAssignmentDone.number] - 1);
                students.push({id: $scope.participants[i].id, x: x, y: lastAssignmentDone.location.y});
            }}
        $scope.studentsOnMap = students;
    }

    function getLatestAssignment(user) {
        var latestAssignment;

        for (var i = 0; i < $scope.assignments.length; i++) {
            var assignmentInfo = $scope.assignments[i].students_tasks;

            for (var j = 0; j < assignmentInfo.length; j++) {
                if (assignmentInfo[j].user_id == user.id){
                    if (!latestAssignment){
                        latestAssignment = {location: $scope.assignments[i].location, number: $scope.assignments[i].number, timestamp: assignmentInfo[j].timestamp};

                    } else if (latestAssignment.timestamp < assignmentInfo[j].timestamp){
                        latestAssignment = {location: $scope.assignments[i].location, number: $scope.assignments[i].number, timestamp: assignmentInfo[j].timestamp};
                    }
                }
            }
        }
        return latestAssignment;
    }

    function getLocations() {
        var locations = []

        for (var i = 0; i < $scope.assignments.length; i++) {
            locations.push([$scope.assignments[i].location.x, $scope.assignments[i].location.y])
        }
        return locations
    }


});
