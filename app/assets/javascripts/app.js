var ProgressApp = angular.module('ProgressApp',['ngRoute', 'ngResource'])

ProgressApp.config(['$routeProvider', function($routeProvider){
   $routeProvider

       .when('/map/:course_id', {
           controller: 'MapController',
           templateUrl: 'templates/map.html'
       })
       .when('/course/new', {
           controller: 'NewCourseController',
           templateUrl: 'templates/course_new.html'
       })
       .when('/users', {
           controller: 'UsersController',
           templateUrl: 'templates/users.html'
       })
       .otherwise({
           redirectTo: '/map/:course_id?1'
       });
}]);