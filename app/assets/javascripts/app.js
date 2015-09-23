var ProgressApp = angular.module('ProgressApp',['ngRoute', 'ngResource'])

ProgressApp.config(['$routeProvider', function($routeProvider){
   $routeProvider

       .when('/map/:course_id', {
           controller: 'MapController',
           templateUrl: 'templates/map.html'
       })
       .when('/new_course',{
           controller: 'NewCourseController',
           templateUrl: 'templates/new_course.html'
      
       })
       .when('/users', {
           controller: 'UsersController',
           templateUrl: 'templates/users.html'
       })
       .otherwise({
           redirectTo: '/map/:course_id?1'
       });
}]);