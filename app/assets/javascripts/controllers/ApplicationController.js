ProgressApp.controller('ApplicationController', function ($scope, $routeParams, $location, httpService) {
    $scope.showNavigation = true;
    window.onSignIn = onSignIn;


    function onSignIn(googleUser) {
        if ($scope.showNavigation == true) {
            var profile = googleUser.getBasicProfile();

            var teacher = {
                name: profile.getName(),
                email: profile.getEmail()
            };


            httpService.getData('/teachers/show', { params: teacher }).then(function(data) {
                var teacherData = data['teacher'];

                if (teacherData.length == 0) {
                    httpService.postData('/teachers', teacher).then(function(data) {
                        teacherData = data['teacher'];
                    });
                }

                $scope.currentUser = teacherData[0];
                $scope.signedIn = true;
            })
        };
    };

    $scope.signOut = function() {
        var auth2 = gapi.auth2.getAuthInstance();

        auth2.signOut();
        $scope.currentUser.courses = [];
        $scope.currentUser = null;
        $scope.signedIn = false;
        $location.path('/index');
    }

    $scope.teacherInfo = function() {
        //"Opettajalle"-linkin toiminta
    }

    $scope.ownPage = function() {
        $location.path('/course_list');
    }

});
