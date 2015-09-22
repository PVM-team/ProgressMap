ProgressApp.controller('NewCourseController', function($scope, $http, $location, StateService) {

    $scope.createCourse = function() {
        var name = $scope.name
        var assignmentCount = $scope.assignmentCount

            var sendData = {
                name: name,
                assignment_count: assignmentCount
            }
        
            $http.post('/courses', sendData).success(function(data) {
                user = StateService.getCurrentUser()

                $location.path("/map/" + data.id)
            })
    }
});
