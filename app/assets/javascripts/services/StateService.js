ProgressApp.service('StateService', function () {

	var current_user;

	this.setCurrentUser = function(user) {
		current_user = user
	}

	this.getCurrentUser = function() {
		return current_user
	}
})