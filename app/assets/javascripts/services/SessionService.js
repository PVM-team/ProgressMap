ProgressApp.service('SessionService', function () {
    var currentUser;

    this.setCurrentUser = function(user) {
        currentUser = user;
    }

    this.getCurrentUser = function(){
        return currentUser;
    }
    
});
