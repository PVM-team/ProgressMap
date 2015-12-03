ProgressApp.controller('ApplicationController', function ($scope, $routeParams, $location, httpService) {
    $scope.showNavigation = true;
    window.onSignIn = onSignIn;

    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();

        var teacher = {
            name: profile.getName(),
            email: profile.getEmail()
        };

        $scope.currentUser = teacher;

        httpService.getData('/teachers/exists', { params: teacher }).then(function(data) {
            if (data != 'true') {
                httpService.postData('/teachers', teacher);
            }
        })
        $scope.signedIn = true;
    }

    $scope.signOut = function() {
        var auth2 = gapi.auth2.getAuthInstance();

        auth2.signOut();
        $scope.currentUser = null;
        $scope.signedIn = false;
    }
});
