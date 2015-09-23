ProgressApp.controller('NewCourseController', function($scope, $location, DataSendService, StateService) {

    $scope.createCourse = function() {
        var name = $scope.name
        var assignmentCount = $scope.assignmentCount

            var newCourse = {
                name: name,
                assignment_count: assignmentCount
            }
        

        DataSendService.addData('/courses', newCourse).then(function(data) {
            var current_user = StateService.getCurrentUser()
            var path = "/map/" + data.id + "/"

            if (current_user) {
                path += current_user.id
            }
            else {
                // What now?
                path += 1
            }

            $location.path(path)
        });
    }
});
