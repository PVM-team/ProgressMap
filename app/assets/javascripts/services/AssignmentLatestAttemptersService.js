ProgressApp.service('AssignmentLatestAttemptersService', function (MapScaleService) {
    var maxStudentsInRow = 3;
	var maxStudentsToShowAroundAssignment = 9;
    var self = this;

	self.latestAttemptersFull = function(assignment) {
        if (assignment.latestAttempters.length > maxStudentsToShowAroundAssignment) {
        }

		return assignment.latestAttempters.length >= maxStudentsToShowAroundAssignment;
	}

    self.originalAssignment = function(student, assignments) {
        if (student.originalAssignment) {
            return assignments[student.originalAssignment.number - 1];
        }
    }

	self.studentIsInLatestAttemptersOfAssignment = function(student, assignment) {
		return indexOfStudentInLatestAttemptersOfAssignment(student, assignment) >= 0;
	}

    this.studentShouldBeInLatestAttemptersOfAssignment = function(student, assignment) {
        if (student.lastDoneAssignment) {

            if (! self.latestAttemptersFull(assignment)) {
                return true;
            }

            for (var i = 0; i < assignment.latestAttempters.length; i++) {
                if (firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student, assignment.latestAttempters[i])) {
                    return true;
                }
            }
        }
        return false;
    }

    this.setStudentToLeaveItsLastDoneAssignment = function(student, assignment) {
        var i = indexOfStudentInLatestAttemptersOfAssignment(student, assignment);
        assignment.latestAttempters[i].leaving = true;
    }

    self.addStudentToLatestAttemptersWithLocation = function(student, assignment, position) {
        student.leaving = false;
        student.reserved = false;
    	assignment.latestAttempters.push(student);
        assignment.latestAttempters[assignment.latestAttempters.length - 1]['location'] = {'x': position.x, 'y': position.y };
    }

    /*
        Yrittää poistaa tekijän assignmentinLatestDoereista, jonne toinen opiskelija siirtyy.
        Palauttaa 'true', mikäli poistettava opiskelija löytyy ja ko. opiskelija ei ole 'dummy' student.
        Opiskelija ei ole 'dummy', mikäli se on oikea opiskelija ja siihen liittyy tällöin studentLayerillä circle.
    */

    this.removeStudentFromLatestAttemptersOfAssignmentFromPosition = function(assignment, position) {

        for (var i = 0; i < assignment.latestAttempters.length; i++) {
            if (locationsAreTheSame(assignment.latestAttempters[i].location, position)) {

                var dummy = assignment.latestAttempters[i].dummy;
                assignment.latestAttempters.splice(i, 1);

                return ! dummy; // palautetaan käytännössä tiedon siitä, liittyykö tähän poistettuun attempteriin circle vai ei. jos liittyy niin dummy = undefined
            }
        }

        return false; // palauttaa tämän, jos paikalla oli toinen student
    }

    /*
        Poistaa studentin assignmentin latestAttemptersista.

        Palauttaa feedbackinä tiedon siitä, onko joku varannut tämän ko. studentin
        position, jotta tiedetään, halutaanko poistetun studentin tilalle etsiä uusi
        student assignmentin attemptersista, jotka eivät ole latestAttemptersista vai ei.
    */

    this.removeStudentFromLatestAttemptersOfAssignment = function(student, assignment) {
        var i = indexOfStudentInLatestAttemptersOfAssignment(student, assignment);
        var attempter = assignment.latestAttempters[i];
        assignment.latestAttempters.splice(i, 1);

        return attempter;
    }

    this.studentToAddInPlaceOfRemovedOne = function(assignment, students) {
        var studentToAdd = null;

        for (var i = 0; i < students.length; i++) {
            var student = students[i];

            if (student.originalAssignment &&
                student.originalAssignment.number == assignment.number &&
                student.lastDoneAssignment &&
                student.lastDoneAssignment.number == assignment.number &&
                ! self.studentIsInLatestAttemptersOfAssignment(student, assignment)) {

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
        var i = indexOfStudentInLatestAttemptersOfAssignment(student, assignment);
        return assignment.latestAttempters[i].location;
    }

	function indexOfStudentInLatestAttemptersOfAssignment(student, assignment) {
        for (var i = 0; i < assignment.latestAttempters.length; i++) {

            if (student.id == assignment.latestAttempters[i].id) {
                return i;
            }
        }
        return -1;
    }

    function firstStudentHasDoneLastDoneAssignmentAfterTheSecondOne(student1, student2) {
        return new Date(student1.lastDoneAssignment.timestamp) - new Date(student2.lastDoneAssignment.timestamp) > 0;
    }

    /*
        Määrittää position, johon studentin circle tulee siirtää sekä varaa ko. position liikkumisen ajaksi.
    */

    this.nextPositionToMoveToAroundAssignment = function(student, assignment) {
        var position = getPositionStudentToMoveToAroundAssignment(student, assignment);
        reservePosition(assignment, position);

        return position;
    }

    /*
        Jos kaikki positiot (5 kpl) assignmentin ympärillä varattu eli jokaiseen menossa intervalin aikana joku,
        tulee ne vapauttaa, jotta niihin pääsee tarvittaessa useampia saman intervalin aikana.

        Jos latestDoereja 5 kpl ja kukaan niistä ei intervalin aikana liikkumassa, uusi positio määräytyy näistä
        kauiten olleen paikalle, joka ei ole vielä tämän intervalin aikana varattu.

        Muuten (kaikki 5 paikkaa eivät varattuina joten mahtuu), positio määräytyy ensimmäisen vapaan position
        mukaan liikuttaessa x-suunnassa vasemmalta oikealle ja y-suunnassa ylhäältä alas.
    */

    function getPositionStudentToMoveToAroundAssignment(student, assignment) {
        if (allPositionsReserved(assignment)) {
            freeAllPositions(assignment);
        }

        if (atLeastOneFreePositionToGoTo(assignment)) {
            return positionOfNewStudentAroundAssignment(student, assignment);
        }

        return locationOfOldestStudentInLatestAttemptersWhichNotReserved(assignment);
    }

    /*
        Kaikki paikat ovat varattuina, jos assignmentilla on maksimimäärä latestDoereja ja jokaisen
        reserved arvo on 'true'.
    */

    function allPositionsReserved(assignment) {
        if (self.latestAttemptersFull(assignment)) {

            for (var i = 0; i < maxStudentsToShowAroundAssignment; i++) {
            
                if (! assignment.latestAttempters[i].reserved) { // null
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    /*
        Palauttaa 'true', jos tehtävän ympärillä on ainakin yksi positio, joka on vapaa.
        Jos siis kaikki positiot eivät ole täynnä, palauttaa true.

        Mikäli latestAttempters on täynnä, tarkistaa, onko joku lähdössä, ja jos on ja kukaan ei ole lähtevän
        positiota varannut, palauttaa myös true.
    */

    function atLeastOneFreePositionToGoTo(assignment) {
        if (self.latestAttemptersFull(assignment)) {

            for (var i = 0; i < assignment.latestAttempters.length; i++) {
                if (assignment.latestAttempters[i].leaving && ! assignment.latestAttempters[i].reserved) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    function freeAllPositions(assignment) {
        for (var i = 0; i < assignment.latestAttempters.length; i++) {
            assignment.latestAttempters[i].reserved = false;
        }
    }

    /*
        Etsii ekan vapaan position assignmentin ympäriltä ja palauttaa sen.
        Mikäli ko. positiossa ei ole attempteria lainkaan, luodaan siihen kohtaan 'dummyStudent', joka
        poistetaan myöhemmin kun liikkuja saapuu sen paikalle.
    */

    function positionOfNewStudentAroundAssignment(student, assignment) {
        var location = assignment.location;
        var lateralPositionOffset = MapScaleService.getRelativeXFromDefaultSize(50);
        var verticalPositionOffset = 0;

        var position = {'x': location.x + lateralPositionOffset, 'y': location.y + verticalPositionOffset };

        for (var i = 0; i < maxStudentsToShowAroundAssignment; i++) {
            var attempter = getStudentByLocationFromLatestAttemptersOfAssignment(assignment, position);

            if (! attempter) {
                var dummyStudent = {'lastDoneAssignment': student.lastDoneAssignment, 'dummy': true};
                self.addStudentToLatestAttemptersWithLocation(dummyStudent, assignment, position);

                return position;
            }

            else if (attempter.leaving && ! attempter.reserved) {
                return position;
            }

            lateralPositionOffset += MapScaleService.getRelativeXFromDefaultSize(30);

            if ((i + 1) % maxStudentsInRow == 0) {
                verticalPositionOffset += 30;
                lateralPositionOffset = MapScaleService.getRelativeXFromDefaultSize(50);
            }

            position = {'x': location.x + lateralPositionOffset, 'y': location.y + verticalPositionOffset };            
        }

    }

    function getStudentByLocationFromLatestAttemptersOfAssignment(assignment, location) {
        for (var i = 0; i < assignment.latestAttempters.length; i++) {
            if (locationsAreTheSame(assignment.latestAttempters[i].location, location)) {
                return assignment.latestAttempters[i];
            }
        }
    }

    function locationOfOldestStudentInLatestAttemptersWhichNotReserved(assignment) {
        var student = oldestStudentInLatestAttemptersOfAssignmentWhichNotReserved(assignment);
        return self.getLocationOfStudent(student, assignment);
    }

    function oldestStudentInLatestAttemptersOfAssignmentWhichNotReserved(assignment) { // assignmentin latestAttempters on täynnä, ainakin yksi ei reserved olemassa
        var studentToGo = null;

        for (var i = 0; i < assignment.latestAttempters.length; i++) {
            var next = assignment.latestAttempters[i];

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

    function reservePosition(assignment, position) {
        for (var i = 0; i < assignment.latestAttempters.length; i++) {

            if (locationsAreTheSame(assignment.latestAttempters[i].location, position)) {
                assignment.latestAttempters[i].reserved = true;
                return;
            }
        }
    }

    /*
        Skaalatut positiot voivat heittää x-koordinaatiltaan oikeasta positiosta hyvin vähän, mutta silti.
        Tuli vastaan tilanne, jossa location1.x = 609.8427272727273 ja location2.x = 609.8427272727272
        ja positioiden tuli olla samat.
    */

    function locationsAreTheSame(location1, location2) {
        return Math.abs(location1.x - location2.x) < 0.000001 &&
               location1.y == location2.y;
    }
})
