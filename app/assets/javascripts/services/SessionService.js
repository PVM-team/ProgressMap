ProgressApp.service('SessionService', function (httpService) {
    var self = this;
    var current_user;

    this.getCurrentUser = function() {
        return current_user;
    }

    self.setCurrentUser = function(user) {
        current_user = user;
    }

    this.loggedIn = function() {
        console.log(current_user)

        return gapi.auth2 && gapi.auth2.getAuthInstance().currentUser.get() &&
               gapi.auth2.getAuthInstance().currentUser.get().po.access_token;
    }

	this.signIn = function(googleUser) {
        var profile = googleUser.getBasicProfile();

        var teacher = {
            name: profile.getName(),
            email: profile.getEmail()
        };

        self.setCurrentUser(teacher);

        httpService.getData('/teachers/exists', { params: teacher }).then(function(data) {
            if (data != 'true') {
                httpService.postData('/teachers', teacher);
            }
        })
    }

	this.signOut = function() {
        var auth2 = gapi.auth2.getAuthInstance();

        auth2.signOut().then(function () {      // ei toimi parhaillaan oikein
        });

        self.setCurrentUser(undefined);
	}
})