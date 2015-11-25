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
       .when('/course/:course_id/edit/', {
            controller: 'EditCourseController',
            templateUrl:'templates/course_edit.html'
       })
       .when('/actionmap/:course_id', {
           controller: 'ActionMapController',
           templateUrl: 'templates/action_map.html'
       })
       .when('/student/:token', {
           controller: 'StudentMapController',
           templateUrl: 'templates/student_map.html'
       })
       .when('/login', {
            controller: 'LoginController',
            templateUrl: 'templates/login.html'
       })
       .otherwise({
           redirectTo: '/map/:course_id?1'
       });
}]);
