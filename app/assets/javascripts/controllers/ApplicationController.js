ProgressApp.controller('ApplicationController', function ($scope, $routeParams, $location) {
    
    $scope.currentUser = null;

    $scope.setCurrentUser = function(user) {
        $scope.currentUser = user;
    }

    $scope.getCurrentUser = function() {
        return $scope.currentUser;
    }
});
