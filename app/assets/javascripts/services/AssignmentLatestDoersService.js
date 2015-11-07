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

    this.setStudentToLeaveItsLastDoneAssignment = function(student, lastDoneAssignment) {
        var i = indexOfStudentInLatestDoersOfAssignment(student, lastDoneAssignment);
        lastDoneAssignment.latestDoers[i].leaving = true;
    }

    this.addStudentToLatestDoersWithLocation = function(student, assignment, scaledPosition) {
    	assignment.latestDoers.push(student);
        assignment.latestDoers[assignment.latestDoers.length - 1]['location'] = {'x': scaledPosition.x, 'y': scaledPosition.y };
    }

    /*
        Merkkaa tekijälle 'leaving' attribuutiksi 'false' eli ei siis liiku tämän intervalin aikana.
        Kutsutaan kahdesta paikasta MoveStudentServiceä:

        1) Kun asetetaan uusi opiskelija kartalle uuden tehtävän kohdalle (leaving tässä vaiheessa ko. opiskelijalle ei määritelty).
        2) Kun asetetaan opiskelija liikkumisjonoon ja muutetaan 'leaving' true --> false.
    */

    this.setLeavingToFalseForStudent = function(student, assignment) {
        var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
        assignment.latestDoers[i]['leaving'] = false;
    }

    /*
        Yrittää poistaa tekijän assignmentinLatestDoereista, jonne toinen opiskelija siirtyy.
        Palauttaa 'true', mikäli poisto onnistuu ja poistettava ei dummy student, 'false' muulloin.

        Poisto onnistuu, mikäli poistettava tekijä ei itse liiku ko. intervalin aikana muualle.

    */

    this.removeStudentFromLatestDoersOfAssignmentWithPosition = function(assignment, position) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {
            if (locationsAreTheSame(assignment.latestDoers[i].location, position)) {

                if (assignment.latestDoers[i].leaving) {
                    return false;
                }
                else {
                    var dummy = assignment.latestDoers[i].dummy;
                    assignment.latestDoers.splice(i , 1);

                    if (dummy) {
                        return false;
                    }
                    return true;
                }
            }
        }

        return false;
    }

    /*
        Poistaa studentin assignmentin latestDoersista.
        Student ei välttämättä ole siellä enää, jos joku toinen on liikkunut tämän tilalle
        ja poistanut tämän latestDoersista tätä kautta!

        Palauttaa feedbackinä tiedon siitä, onko joku varannut tämän ko. studentin
        position, jotta tiedetään, halutaanko poistetun studentin tilalle etsiä uusi
        student assignmentin tekijöistä, jotka eivät ole latestDoersista vai ei.
        Ei siis haeta uutta tekijää tilalle, jos joku on tämän varannut ja tähän
        tulossa.
    */

    this.removeStudentFromLatestDoersOfAssignment = function(student, assignment) {
        var i = indexOfStudentInLatestDoersOfAssignment(student, assignment);
        var positionReserved;

        if (i >= 0) {
            positionReserved = assignment.latestDoers[i].reserved;
            assignment.latestDoers.splice(i, 1);            
        }

        return positionReserved;
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

    this.freePosition = function(assignment, position) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (locationsAreTheSame(assignment.latestDoers[i].location, position)) {
                assignment.latestDoers[i].reserved = false;
                return;
            }
        }
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

        Muuten (kaikki 5 paikkaa eivät varattuina joten mahtuu), 
    */

    function getPositionStudentToMoveToAroundAssignment(student, assignment) {
        if (allPositionsReserved(assignment)) {
            freeAllPositions(assignment);
        }

        if (self.latestDoersFull(assignment) && ! atLeastOneStudentLeavingFromAssignment(assignment)) {
            return locationOfOldestStudentInLatestDoersWhichNotReserved(assignment);
        }
        return positionOfNewStudentAroundAssignment(student, assignment);
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

    function atLeastOneStudentLeavingFromAssignment(assignment) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {
            if (assignment.latestDoers[i].leaving) {
                return true;
            }
        }
        return false;
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

        console.log(student);

        for (var i = 0; i < maxStudentsToShowAroundAssignment; i++) {
            var doer = getStudentByLocationFromLatestDoersOfAssignment(assignment, position);

            console.log(doer);

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
        return null;
    }

        /*
        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (! assignment.latestDoers[i].reserved &&
                assignment.latestDoers[i].leaving || ! studentLayer.hitTest(position)) { // uusi positio välissä, josta circle siirtynyt aiemmin pois ja positiota ei varattu kellekään jo liikkuvalle
                return position;
            }

            lateralPositionOffset += MapScaleService.scaleByDefaultWidth(30);

            if ((i + 1) % maxStudentsInRow == 0) {
                verticalPositionOffset += 30;
                lateralPositionOffset = MapScaleService.scaleByDefaultWidth(50);
            }

            var position = {'x': location.x + lateralPositionOffset, 'y': location.y + verticalPositionOffset };
        }

        createDummyStudentInLatestDoersOfAssignment(student.lastDoneAssignment, assignment, position); // tee uusi varattu dummy student ja lisää doersin perälle
        return position; // uusi positio perällä, yleisempi tapaus */


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

    function locationsAreTheSame(location1, location2) {
        return location1.x == location2.x &&
               location1.y == location2.y;
    }
})