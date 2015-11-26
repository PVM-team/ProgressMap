ProgressApp.controller('LoginController', function($scope, $routeParams, $location, httpService) {
    window.onSignIn = onSignIn;
    var teachers = [];

    function getTeachers() {
        httpService.getData('/teachers/show.json').then(function(data){
         teachers = data['teachers'];
        });
    }
    
    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());
        console.log('Id_token: ' + googleUser.getAuthResponse().id_token)
    }


    $scope.signOut = function() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
            console.log('User signed out.');
        });
    };


});
