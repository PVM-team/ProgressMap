ProgressApp.controller('CourseListController', function($rootScope, $scope, $routeParams, $location, httpService, CanvasService, AssignmentDependenciesService) {
    $rootScope.showNavigation = true;
    $scope.teacher = $rootScope.currentUser;

    if (! $scope.teacher) {
        $location.path('/');
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