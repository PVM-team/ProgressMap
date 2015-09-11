ProgressApp.controller('MainController', function($scope){
       $scope.message = 'moi kaikki';
       $scope.test = 'Hello World';
       $scope.lista = [
           'post 1',
           'post 2',
           'post 3'
       ];
       $scope.addPost = function(item){
           $scope.lista.push(item)
       }
   });

