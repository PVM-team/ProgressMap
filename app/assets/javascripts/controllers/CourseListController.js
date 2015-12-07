ProgressApp.controller('CourseListController', function($scope, $routeParams, $location, httpService, CanvasService, AssignmentDependenciesService) {
    $scope.showNavigation = true;

    if (! $scope.currentUser) {
        $location.path('/');
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