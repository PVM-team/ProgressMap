ProgressApp.service('StateService', function () {

	var current_student;
    // var current_course;
    
	this.setCurrentStudent = function(student) {
		current_student = student;
	}

	this.getCurrentStudent = function() {
		return current_student;
	}

    /* this.setCurrentCourse = function(course) {		// ei taideta hyödyntää missään?
        current_course = course;
    }

    this.getCurrentCourse = function() {
        return current_course;
    } */
})
