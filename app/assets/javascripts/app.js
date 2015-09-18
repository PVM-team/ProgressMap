var ProgressApp = angular.module('ProgressApp',['ngRoute', 'ngResource'])

ProgressApp.config(['$routeProvider', function($routeProvider){
   $routeProvider
       .when('/', {
           controller: 'MapController',
           templateUrl: 'templates/map.html'		   
       })
       .when('/test',{
           controller: 'MainController'
	   	
       })
       .otherwise({
           redirectTo: '/'
       });
}]);

