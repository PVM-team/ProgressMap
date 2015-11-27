ProgressApp.controller('LoginController', function($scope, $routeParams, $location, httpService) {
    window.onSignIn = onSignIn;


    function onSignIn(googleUser) {
        var teachers = [];
        httpService.getData('/teachers/show.json', {params:{}}).then(function(data){
            teachers = data['teachers'];
            var profile = googleUser.getBasicProfile();

            for (var i = 0; i < teachers.length; i++) {
                if(teachers[i].email == profile.getEmail()) {
                    $scope.setCurrentUser(teachers[i]);   
                }
            }; 
            
            if ($scope.getCurrentUser() == null) {
                var teacher = {
                    name: profile.getName(),
                    email: profile.getEmail()
                };

                httpService.postData('/teachers', teacher).then(function (data) {
                    console.log(data);
                })
                $scope.setCurrentUser(teacher);
                console.log(teacher.name);
            };
            
        });
        /*console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
          console.log('Name: ' + profile.getName());
          console.log('Image URL: ' + profile.getImageUrl());
          console.log('Email: ' + profile.getEmail());
          console.log('Id_token: ' + googleUser.getAuthResponse().id_token)
          */
    }


    $scope.signOut = function() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
        });
        $scope.setCurrentUser(null);
    };


});
