ProgressApp.service('StateService', function () {

	var current_user;
    var current_course;
    
	this.setCurrentUser = function(user) {
		current_user = user
	}

	this.getCurrentUser = function() {
		return current_user
	}

    this.setCurrentCourse = function(course) {
        current_course = course;
    }

    this.getCurrentCourse = function() {
        return current_course;
    }
})
