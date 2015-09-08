var ProgressApp = angular.module('ProgressApp',['ngRoute', 'templates', 'ngResource'])

ProgressApp.config(function($routeProvider){
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
})