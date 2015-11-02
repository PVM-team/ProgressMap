ProgressApp.service('AssignmentLatestDoersService', function () {
	var maxStudentsToShowAroundAssignment = 5;

	this.latestDoersFull = function(assignment) {
		return assignment.latestDoers.length == maxStudentsToShowAroundAssignment;
	}

    this.originalAssignment = function(student, assignments) {
        for (var i = 0; i < assignments.length; i++) {
            var assignment = assignments[i];

            for (var j = 0; j < assignment.latestDoers.length; j++) {

                if (studentIsInLatestDoers(student, assignment)) {
                    return assignment;
                }
            }
        }
        return null;
    }

	this.studentIsInLatestDoersOfAssignment = function(student, assignment) {
		return studentIsInLatestDoers(student, assignment);
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

    this.removeStudentFromLatestDoersOfAssignment = function(studentToGo, assignment) {
    	removeStudentFromLatestDoers(studentToGo, assignment);
    }

    this.removeTheOldestStudentFromLatestDoers = function(assignment) {
    	var studentToGo = oldestStudentInLatestDoers(assignment);
    	removeStudentFromLatestDoers(studentToGo, assignment);
    }

    this.studentToAddInPlaceOfRemovedOne = function(assignment, students) {
        var studentToAdd = null;

        for (var i = 0; i < students.length; i++) {
            var student = students[i];

            if (student.lastDoneAssignment &&
                student.lastDoneAssignment.number == assignment.number &&
                studentIsInLatestDoers(student, assignment)) {

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
    	return locationOfStudent(student);
    }

    this.getLocationOfStudent = function(student, assignment) {
    	return locationOfStudent(student, assignment);
    }

    this.setLocationOfStudent = function(student, x, y) {
    	student['location'] = {'x': x, 'y': y };
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

    function removeStudentFromLatestDoers(student, assignment) {
        var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
        assignment.latestDoers.splice(i, 1);
    }

    function locationOfStudent(student, assignment) { // student in latestDoers of assignment
        var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
        return assignment.latestDoers[i].location;
    }

    function firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student1, student2) {
        return new Date(student1.lastDoneAssignment.timestamp) - new Date(student2.lastDoneAssignment.timestamp) > 0;
    }

    function studentIsInLatestDoers(student, assignment) {
    	return indexOfStudentInLatestDoersOfAssignment(student, assignment) >= 0;
    }
})