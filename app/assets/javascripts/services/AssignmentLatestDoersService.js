ProgressApp.service('AssignmentLatestDoersService', function (MapScaleService) {
    var maxStudentsInRow = 3;
	var maxStudentsToShowAroundAssignment = 5;
    var self = this;

	self.latestDoersFull = function(assignment) {
        if (assignment.latestDoers.length > maxStudentsToShowAroundAssignment) {
            console.log("Error! Length of latestDoers for assignment no." + assignment.number + " = " + assignment.latestDoers.length)
        }

		return assignment.latestDoers.length >= maxStudentsToShowAroundAssignment;
	}

    /*this.originalAssignment = function(student, assignments) {
        for (var i = 0; i < assignments.length; i++) {
            var assignment = assignments[i];

            if (self.studentIsInLatestDoersOfAssignment(student, assignment)) {
                return assignment;
            }
        }
        return null;
    } */

	self.studentIsInLatestDoersOfAssignment = function(student, assignment) {
		return indexOfStudentInLatestDoersOfAssignment(student, assignment) >= 0;
	}

    this.studentShouldBeInLatestDoersOfAssignment = function(student, assignment) {
        if (student.lastDoneAssignment) {

            if (! self.latestDoersFull(assignment)) {
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

    this.setStudentToLeaveItsLastDoneAssignment = function(student, assignment) {
        var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
        assignment.latestDoers[i].leaving = true;
    }

    this.addStudentToLatestDoersWithLocation = function(student, assignment, scaledPosition) {
    	assignment.latestDoers.push(student);
        assignment.latestDoers[assignment.latestDoers.length - 1]['location'] = {'x': scaledPosition.x, 'y': scaledPosition.y };
    }

    /*
        Yrittää poistaa tekijän assignmentinLatestDoereista, jonne toinen opiskelija siirtyy.
        Palauttaa 'true', mikäli poistettava opiskelija löytyy ja ko. opiskelija ei ole 'dummy' student.
        Opiskelija ei ole 'dummy', mikäli se on oikea opiskelija ja siihen liittyy tällöin studentLayerillä circle.
    */

    this.removeStudentFromLatestDoersOfAssignmentFromPosition = function(assignment, position) {

        for (var i = 0; i < assignment.latestDoers.length; i++) {
            if (locationsAreTheSame(assignment.latestDoers[i].location, position)) {

                var dummy = assignment.latestDoers[i].dummy;
                assignment.latestDoers.splice(i, 1);

                return ! dummy; // palautetaan käytännössä tiedon siitä, liittyykö tähän poistettuun doeriin circle vai ei. jos liittyy niin dummy = false
            }
        }

        return false; // palauttaa tämän, jos paikalla oli toinen student
    }

    /*
        Poistaa studentin assignmentin latestDoersista.

        Palauttaa feedbackinä tiedon siitä, onko joku varannut tämän ko. studentin
        position, jotta tiedetään, halutaanko poistetun studentin tilalle etsiä uusi
        student assignmentin doersista, jotka eivät ole latestDoersista vai ei.
    */

    this.removeStudentFromLatestDoersOfAssignment = function(student, assignment) {
        var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
        var doer = assignment.latestDoers[i];
        assignment.latestDoers.splice(i, 1);

        return doer;
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

        return locationOfOldestStudentInLatestDoersWhichNotReserved(assignment);
    }

    /*
        Kaikki paikat ovat varattuina, jos assignmentilla on maksimimäärä latestDoereja ja jokaisen
        reserved arvo on 'true'.
    */

    function allPositionsReserved(assignment) {
        if (self.latestDoersFull(assignment)) {

            for (var i = 0; i < maxStudentsToShowAroundAssignment; i++) {
            
                if (! assignment.latestDoers[i].reserved) { // null
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

        Mikäli latestDoers on täynnä, tarkistaa, onko joku lähdössä, ja jos on ja kukaan ei ole lähtevän
        positiota varannut, palauttaa myös true.
    */

    function atLeastOneFreePositionToGoTo(assignment) {
        if (self.latestDoersFull(assignment)) {

            for (var i = 0; i < assignment.latestDoers.length; i++) {
                if (assignment.latestDoers[i].leaving && ! assignment.latestDoers[i].reserved) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    function freeAllPositions(assignment) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {
            assignment.latestDoers[i].reserved = false;
        }
    }    

    function positionOfNewStudentAroundAssignment(student, assignment) {
        var location = assignment.location;
        var lateralPositionOffset = MapScaleService.scaleByDefaultWidth(50);
        var verticalPositionOffset = 0;

        var position = {'x': location.x + lateralPositionOffset, 'y': location.y + verticalPositionOffset };

        for (var i = 0; i < maxStudentsToShowAroundAssignment; i++) {
            var doer = getStudentByLocationFromLatestDoersOfAssignment(assignment, position);

            if (! doer) {
                createDummyStudentInLatestDoersOfAssignment(student.lastDoneAssignment, assignment, position);
                return position;
            }

            else if (doer.leaving && ! doer.reserved) {
                return position;
            }

            lateralPositionOffset += MapScaleService.scaleByDefaultWidth(30);

            if ((i + 1) % maxStudentsInRow == 0) {
                verticalPositionOffset += 30;
                lateralPositionOffset = MapScaleService.scaleByDefaultWidth(50);
            }

            position = {'x': location.x + lateralPositionOffset, 'y': location.y + verticalPositionOffset };            
        }

        console.log("error when trying to find free position to move to around assignment")
    }

    function getStudentByLocationFromLatestDoersOfAssignment(assignment, location) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {
            if (locationsAreTheSame(assignment.latestDoers[i].location, location)) {
                return assignment.latestDoers[i];
            }
        }
        return null;
    }

    function locationOfOldestStudentInLatestDoersWhichNotReserved(assignment) {
        var student = oldestStudentInLatestDoersOfAssignmentWhichNotReserved(assignment);
        return self.getLocationOfStudent(student, assignment);
    }

    function oldestStudentInLatestDoersOfAssignmentWhichNotReserved(assignment) { // assignmentin latestDoers on täynnä, ainakin yksi ei reserved olemassa
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

    function reservePosition(assignment, position) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (locationsAreTheSame(assignment.latestDoers[i].location, position)) {
                assignment.latestDoers[i].reserved = true;
                return;
            }
        }
    }

    /*
        Lisää uuden 'dummyStudetin' assignmentin latestDoersiin, joka luodaan sitä varten, että ko. lokaatio
        voidaan varata siihen liikkuvalle studentille. Tarvitsee 'dummy' määreen (true) sitä varten että
        kun myöhemmin tämä opiskelija poistetaan assignmentin latestDoersista uuden siihen siirtyvän tieltä,
        ei kartalta yritetä poistaa palluraa ko. kohdasta.
    */

    function createDummyStudentInLatestDoersOfAssignment(lastDoneAssignment, assignment, position) {
        var dummyStudent = {'location': position, 'lastDoneAssignment': lastDoneAssignment, 'dummy': true };
        assignment.latestDoers.push(dummyStudent);
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