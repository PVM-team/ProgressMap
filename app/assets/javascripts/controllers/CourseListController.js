ProgressApp.controller('CourseListController', function($scope, $routeParams, $location, httpService, CanvasService, AssignmentDependenciesService) {
    $scope.$parent.showNavigation = true;

    $scope.moveToCourseDetails = function(course){
        $location.path('/course/' + course.id + '/edit/')
    }
});
