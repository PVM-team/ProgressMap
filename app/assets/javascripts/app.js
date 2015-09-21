var ProgressApp = angular.module('ProgressApp',['ngRoute', 'ngResource'])

ProgressApp.config(['$routeProvider', function($routeProvider){
   $routeProvider
       .when('/', {
           controller: 'MapController',
           templateUrl: 'templates/map.html'		   
       })
       .when('/newcourse',{
           controller: 'MapController',
           templateUrl: 'templates/newcourse.html'
      
       })
       .otherwise({
           redirectTo: '/'
       });
}]);

