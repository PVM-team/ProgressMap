ProgressApp.controller('NewCourseController', function($scope, $location, DataSendService) {

    $scope.createCourse = function() {
        var name = $scope.name
        var assignmentCount = $scope.assignmentCount

            var newCourse = {
                name: name,
                assignment_count: assignmentCount
            }
        

        DataSendService.addData('/courses', newCourse).then(function(data){
            $location.path("/map/" + data.id)
        });
    }
});
