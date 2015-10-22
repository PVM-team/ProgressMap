ProgressApp.controller('StudentMapController', function ($scope, $routeParams, $location, AssignmentDependenciesService, CanvasService, httpService, StateService) {

    httpService.getData('/students/show', { params: { token: $routeParams.token }}).then(function (data) {

        if (!validRequest(data)) {
            $location.path("/");
            return;
        }

        $scope.assignments = data["assignments"];
        $scope.course = data["course"][0];
        $scope.student = data["student"][0];

        StateService.setCurrentStudent($scope.student);
        setDoneAssignments();

        CanvasService.initiateCanvas($scope.assignments.length, 1000, document.getElementById("mapElements"), "rgba(30, 85, 205, 0.50");
        CanvasService.drawSmoothPaths($scope.assignments);
    })

    $scope.moveToActionMap = function() {
        $location.path('/actionmap/' + $scope.course.id);
    }

    $scope.showDependencies = function (assignment) {
        AssignmentDependenciesService.showDependencies(assignment, $scope.assignments, CanvasService.getContext());
    }

    $scope.hideDependencies = function (assignment) {
        AssignmentDependenciesService.hideDependencies(assignment, $scope.assignments);
        CanvasService.redraw("rgba(30, 85, 205, 0.50");
        CanvasService.drawSmoothPaths($scope.assignments);
    }

    function setDoneAssignments() {
        var done_assignments = [];

        for (var i = 0; i < $scope.assignments.length; i++) {
            var doers = $scope.assignments[i].doers;

            if (indexOfValueWithId(doers, $scope.student.id) >= 0) {
                done_assignments.push($scope.assignments[i]);
            }
        }
        $scope.done_assignments = done_assignments;
    }

    $scope.assignmentCompleted = function (assignment) {
        return $scope.done_assignments.indexOf(assignment) >= 0;
    }

    function removeValueFromList(list, index) {
        list.splice(index, 1);
    }


    function indexOfValueWithId(list, id) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                return i;
            }
        }

        return -1;
    }

    function validRequest(data) {
        return data['course'][0]
    }
})