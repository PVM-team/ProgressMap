ProgressApp.controller('ApplicationController', function($rootScope, $routeParams, $location, httpService) {
    $rootScope.showNavigation = true;
    window.onSignIn = onSignIn;

    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();

        var httpData = {
            name: profile.getName(),
            email: profile.getEmail()
        };


        httpService.getData('/teachers/show', { params: httpData }).then(function(data) {
            var teacher = data['teacher'][0];

            if (teacher) {
                logIn(teacher);
                return;
            }

            httpService.postData('/teachers', httpData).then(function(data) {
                logIn(data['teacher'][0]);
            });
        })
    };

    $rootScope.signOut = function() {
        var auth2 = gapi.auth2.getAuthInstance();

        auth2.signOut();
        $rootScope.currentUser = undefined;
        $rootScope.signedIn = false;
        $location.path('/');
    }

    $rootScope.teacherInfo = function() {
        //"Opettajalle"-linkin toiminta
    }

    $rootScope.ownPage = function() {
        $location.path('/course_list');
    }

    function logIn(teacher) {
        $rootScope.currentUser = teacher;
        $rootScope.signedIn = true;
    }
})