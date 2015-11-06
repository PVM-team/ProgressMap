ProgressApp.service('AssignmentLatestDoersService', function (MapScaleService) {
    var maxStudentsInRow = 3;
	var maxStudentsToShowAroundAssignment = 5;
    var self = this;

	self.latestDoersFull = function(assignment) {
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

    this.addStudentToLatestDoersWithLocation = function(student, assignment, scaledposition) {
    	assignment.latestDoers.push(student);
        assignment.latestDoers[assignment.latestDoers.length - 1]['location'] = {'x': scaledposition.x, 'y': scaledposition.y };
    }

    this.removeTheOldestStudentFromLatestDoers = function(assignment) {
        var studentToGo = oldestStudentInLatestDoersOfAssignment(assignment);
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

    function oldestStudentInLatestDoersOfAssignment(assignment) { // assignmentin latestDoers on täynnä, ainakin yksi ei reserved olemassa
        var studentToGo = null;

        for (var i = 0; i < assignment.latestDoers.length; i++) {
            var next = assignment.latestDoers[i];

            if (! next.reserved) {

                if (! studentToGo) {
                    studentToGo = next;
                }

                else if (firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(studentToGo, next)) {
                    studentToGo = next;
                }
            }
        }
        return studentToGo;
    }

    function firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student1, student2) {
        return new Date(student1.lastDoneAssignment.timestamp) - new Date(student2.lastDoneAssignment.timestamp) > 0;
    }

    this.freePosition = function(assignment, position) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (locationsAreTheSame(assignment.latestDoers[i].location, position)) {
                assignment.latestDoers[i].reserved = false;
                return;
            }
        }
    }

    this.nextPositionToMoveToAroundAssignment = function(student, assignment) {
        var position = getPositionForMovingNewStudentAroundAssignment(student, assignment);
        reservePosition(assignment, position);

        return position;
    }

    function getPositionForMovingNewStudentAroundAssignment(student, assignment) {
        if (self.latestDoersFull(assignment)) {

            if (allPositionsReserved(assignment)) {
                freeAllPositions();
            }
            return locationOfOldestStudentInLatestDoers(assignment);
        }

        return positionOfNewStudentAroundAssignment(student, assignment);
    }

    function allPositionsReserved(assignment) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {
            
            if (! assignment.latestDoers[i].reserved) { // reserved = null, tai false
                return false;
            }
        }
        return true;
    }

    function freeAllPositions(assignment) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {
            assignment.latestDoers[i].reserved == false;
        }
    }    

    function positionOfNewStudentAroundAssignment(student, assignment) {
        var location = assignment.location;
        var lateralPositionOffset = 50;
        var verticalPositionOffset = 0;

        var position = {'x': location.x + lateralPositionOffset, 'y': location.y + verticalPositionOffset };
        position = scalePositionToWindowWidth(position);

        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (! paper.project.hitTest(position) && ! assignment.latestDoers[i].reserved) { // uusi positio välissä, josta circle siirtynyt aiemmin pois ja positiota ei varattu kellekään jo liikkuvalle
                return position;
            }

            lateralPositionOffset += 30;

            if ((i + 1) % maxStudentsInRow == 0) {
                verticalPositionOffset += 30;
                lateralPositionOffset = 50;
            }

            position = {'x': location.x + lateralPositionOffset, 'y': location.y + verticalPositionOffset };
            position = scalePositionToWindowWidth(position);
        }

        createDummyStudentInLatestDoersOfAssignment(student.lastDoneAssignment, assignment, position); // tee uusi varattu dummy student ja lisää doersin perälle
        return position; // uusi positio perällä, yleisempi tapaus
    }

    function locationOfOldestStudentInLatestDoers(assignment) {
        var student = oldestStudentInLatestDoersOfAssignment(assignment);
        return self.getLocationOfStudent(student, assignment);
    }

    function reservePosition(assignment, position) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (locationsAreTheSame(assignment.latestDoers[i].location, position)) {
                assignment.latestDoers[i].reserved = true;
                return;
            }
        }
    }

    function createDummyStudentInLatestDoersOfAssignment(lastDoneAssignment, assignment, position) {
        var dummyStudent = {'location': position, 'lastDoneAssignment': lastDoneAssignment };
        assignment.latestDoers.push(dummyStudent);
    }

    function locationsAreTheSame(location1, location2) {
        return location1.x == location2.x &&
               location1.y == location2.y;
    }

    function scalePositionToWindowWidth(position) {
        position.x = MapScaleService.getRelativeX(position.x);
        return position;
    }
})