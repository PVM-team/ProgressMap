ProgressApp.controller('CourseListController', function($scope, $routeParams, $window, $location, httpService, CanvasService, AssignmentDependenciesService) {
    $scope.showNavigation = true;

    if (! $scope.currentUser) {
        $window.location.href = '/';
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