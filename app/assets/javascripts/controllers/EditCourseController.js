ProgressApp.controller('EditCourseController', function($scope, $routeParams, $location, StateService, DataSendService) {
    console.log($routeParams.course_id);

    $scope.course = data['course'][$routeParams.course_id];
});
