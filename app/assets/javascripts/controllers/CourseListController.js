ProgressApp.controller('CourseListController', function($scope, $routeParams, $window, httpService, CanvasService, AssignmentDependenciesService) {
    $scope.showNavigation = true;

    if (! $scope.currentUser) {
        $window.location.path = '/';
        return;
    }

    $scope.moveToCourseActionMap = function(course) {
    	$location.path('/actionmap/' + course.id)
    }

    $scope.moveToEditCourseView = function(course) {
        $location.path('/course/' + course.id + '/edit/')
    }

    $scope.createNewCourse = function() {
        $location.path('/course/new');
    }
});