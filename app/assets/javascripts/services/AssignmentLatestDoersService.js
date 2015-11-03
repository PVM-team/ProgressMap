ProgressApp.service('AssignmentLatestDoersService', function () {
	var maxStudentsToShowAroundAssignment = 5;
    var self = this;

	this.latestDoersFull = function(assignment) {
		return assignment.latestDoers.length == maxStudentsToShowAroundAssignment;
	}

    this.originalAssignment = function(student, assignments) {
        for (var i = 0; i < assignments.length; i++) {
            var assignment = assignments[i];

            for (var j = 0; j < assignment.latestDoers.length; j++) {

                if (self.studentIsInLatestDoersOfAssignment(student, assignment)) {
                    return assignment;
                }
            }
        }
        return null;
    }

	self.studentIsInLatestDoersOfAssignment = function(student, assignment) {
		return indexOfStudentInLatestDoersOfAssignment(student, assignment) >= 0;
	}

    this.studentShouldBeInLatestDoersOfAssignment = function(student, assignment) {
        if (student.lastDoneAssignment) {

			if (assignment.latestDoers.length < maxStudentsToShowAroundAssignment) {
				return true;
            }

            for (var i = 0; i < assignment.latestDoers.length; i++) {
                if (firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student, assignment.latestDoers[i])) {
                    return true;
                }
            }
        }
        return false;
    }

    this.addStudentToLatestDoersWithLocation = function(student, assignment, position) {
    	assignment.latestDoers.push(student);
        assignment.latestDoers[assignment.latestDoers.length - 1]['location'] = {'x': position.x, 'y': position.y };
    }

    this.removeTheOldestStudentFromLatestDoers = function(assignment) {
        var studentToGo = oldestStudentInLatestDoers(assignment);
        self.removeStudentFromLatestDoersOfAssignment(studentToGo, assignment);
    }

    self.removeStudentFromLatestDoersOfAssignment = function(student, assignment) {
        var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
        assignment.latestDoers.splice(i, 1);
    }

    this.studentToAddInPlaceOfRemovedOne = function(assignment, students) {
        var studentToAdd = null;

        for (var i = 0; i < students.length; i++) {
            var student = students[i];

            if (student.lastDoneAssignment &&
                student.lastDoneAssignment.number == assignment.number &&
                ! self.studentIsInLatestDoersOfAssignment(student, assignment)) {

                if (! studentToAdd) {
                    studentToAdd = student;
                }

                else if (firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student, studentToAdd)) {
                	studentToAdd = student;
            	}
        	}
        }

        return studentToAdd;    	
    }

    this.locationOfOldestStudentInLatestDoers = function(assignment) {
    	var student = oldestStudentInLatestDoers(assignment);
    	return self.getLocationOfStudent(student, assignment);
    }

    self.getLocationOfStudent = function(student, assignment) {
        var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
        return assignment.latestDoers[i].location;
    }

	function indexOfStudentInLatestDoersOfAssignment(student, assignment) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (student.id == assignment.latestDoers[i].id) {
                return i;
            }
        }
        return -1;
    }

    function oldestStudentInLatestDoers(assignment) { // assignmentin latestDoers on täynnä
        var studentToGo = assignment.latestDoers[0];

        for (var i = 1; i < assignment.latestDoers.length; i++) {
            var next = assignment.latestDoers[i];

            if (next && firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(studentToGo, next)) {
                studentToGo = next;
            }
        }
        return studentToGo;
    }

    function firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student1, student2) {
        return new Date(student1.lastDoneAssignment.timestamp) - new Date(student2.lastDoneAssignment.timestamp) > 0;
    }
})