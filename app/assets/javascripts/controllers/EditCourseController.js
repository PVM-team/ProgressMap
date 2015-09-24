ProgressApp.controller('EditCourseController', function($scope, $routeParams, $location, StateService, httpService) {
    var courses = [];
    
    httpService.getData('courses/all', {}).then(function(data) {
        courses = data['courses'];
        for (var i = 0; i < courses.length; i++) {
            if (courses[i].id == $routeParams.course_id) {
                $scope.course = courses[i];
                $scope.originalName = $scope.course.name;
                console.log(courses[i]);
                $scope.participants = courses[i]; 
                break;
            }
        }

    });
});
