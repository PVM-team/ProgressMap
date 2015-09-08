var ProgressApp = angular.module('ProgressApp',['ngRoute', 'templates'])

ProgressApp.config(function($routeProvider){
   $routeProvider
       .when('/', {
           controller: 'AbcController',
           templateUrl: 'templates/test.html'
       })
       .when('/test',{
           controller: 'MainController'

       })
       .otherwise({
           redirectTo: '/'
       });
})