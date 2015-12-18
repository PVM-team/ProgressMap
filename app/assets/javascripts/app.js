var ProgressApp = angular.module('ProgressApp',['ngRoute', 'ngResource', 'ui.bootstrap'])

ProgressApp.config(['$routeProvider', function($routeProvider){
   $routeProvider

       .when('/index', {
        controller: 'IndexController',
           templateUrl: 'templates/index.html'
       })
       .when('/teacher_info', {
           controller: 'IndexController',
           templateUrl: 'templates/teacher_info.html'
       })
       .when('/course_list', {
           controller: 'CourseListController',
           templateUrl: 'templates/course_list.html'
       })
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
       
       .otherwise({
           redirectTo: '/index'
       });
}]);
