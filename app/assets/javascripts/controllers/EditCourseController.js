ProgressApp.controller('EditCourseController', function($scope, $routeParams, $location, StateService, httpService) {
    var courses = [];

    httpService.getData('courses/all', {}).then(function(data) {
        courses = data['courses'];
        for (var i = 0; i < courses.length; i++) {
            if (courses[i].id == $routeParams.course_id) {
                $scope.course = courses[i];
                $scope.originalName = $scope.course.name;
                break;
            }
        }

        httpService.getData('/map/init.json', {params: {course_id: $routeParams.course_id}}).then(function(data){
            $scope.assignments = data["assignments"]
            $scope.participants = data["participants"]
        });
    });
});
