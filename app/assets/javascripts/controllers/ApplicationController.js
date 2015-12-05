ProgressApp.controller('ApplicationController', function($rootScope, $scope, $routeParams, $location, httpService) {
    $rootScope.showNavigation = true;
    window.onSignIn = onSignIn;

    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();

        var data = {
            name: profile.getName(),
            email: profile.getEmail()
        };


        httpService.getData('/teachers/show', { params: data }).then(function(data) {
            var teacher = data['teacher'][0];

            if (! teacher) {
                httpService.postData('/teachers', teacher).then(function(data) {
                    teacher = data['teacher'][0];
                });
            }

            $rootScope.currentUser = teacher;
            $scope.signedIn = true;
        })
    };

    $scope.signOut = function() {
        var auth2 = gapi.auth2.getAuthInstance();

        auth2.signOut();
        $rootScope.currentUser = undefined;
        $scope.signedIn = false;
        $location.path('/');
    }

    $scope.teacherInfo = function() {
        //"Opettajalle"-linkin toiminta
    }

    $scope.ownPage = function() {
        $location.path('/course_list');
    }

});
