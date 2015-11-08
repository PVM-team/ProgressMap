ProgressApp.service('ActionMapUpdaterService', function (AssignmentLatestDoersService, AssignmentCirclesService, MapScaleService, MoveStudentCircleService, StudentIconService) {

    var assignments; // muotoa {'id', 'number', latestDoers: {'id', 'location', 'reserved', 'leaving', 'dummy'}}
                     // latestDoersissa jokaisella tulee olla aina id ja location. Muut attribuutit ovat tilanteesta riippuen olemassa tai sitten ei, jos niitä ei ko. doerin kohdalla tarvita
                     // reserved = "'true', jos toinen opiskelija on varannut tämän opiskelijan position ja liikkuu tämän paikalle ko. intervalin aikana"
                     // leaving = "'true' jos tämä opiskelija siirtyy ko. intervalin aikana. on olemassa uusien siirtymälokaatioiden määrityksen aikana olemassa."
                     // dummy = "määritelty ja 'true', mikäli assignmentilla ei ole oikeasti tätä tekijää, mutta joku liikkuu tämän positioon ja on tehnyt siihen jo varauksen. tarvitaan myöhemmin tietona siitä, tuleeko kartalta poistaa 'circle' tämän positiosta. ei luonnollisesti poisteta circleä, jos dummy = true, sillä "dummy = true" tarkoittaa että kartalla ei ole tämän positiossa mitään.

    var students; // muotoa: {'id', 'lastDoneAssignment': {'number', 'timestamp'}}

    var movingQueue = [];
    var movingInterval;
    var intervalLength = 10000;
    var lastWaitTime = 0;
    var minSpeed = 90;

    var assignmentLayer;
    var percentageLayer;
    var studentLayer;

    this.updateAssignmentLocations = function() {
        for (var i = 0; i < assignments.length; i++) {
            assignments[i].location.x = MapScaleService.getRelativeX(assignments[i].location.x);
        }
    }

    this.updateAssignmentsLatestDoersLocations = function() {
        for (var i = 0; i < assignments.length; i++) {

            for (var j = 0; j < assignments[i].latestDoers.length; j++) {
                assignments[i].latestDoers[j].location.x = MapScaleService.getRelativeX(assignments[i].latestDoers[j].location.x);
            }
        }
    }
 
    this.initialize = function(initial_assigments, stLayer, assLayer, perLayer) {
        assignments = initial_assigments;
        studentLayer = stLayer;
        assignmentLayer = assLayer;
        percentageLayer = perLayer;
    }

    this.initializeLatestDoer = function(doer, location) {
        doer['location'] = {'x': location.x, 'y': location.y};
    }

    /*
        Päivittää tilanteen siirtämällä opiskelijoita paikoista toisiin sekä lisäämällä kartalle
        opiskelijat, jotka eivät ole tällä hetkellä näkyvissä, mutta viime intervalin aikana
        tekivät jonkin tehtävän.

        Metodin sisäiset funktiokutsut tulee suorittaa samassa järjestyksessä kuin ne ovat nytkin.
    */

    this.update = function(new_students) {
        students = new_students;

        var studentsToMove = movingStudents();
        setLeavingAttributesForAssignmentsLatestDoersMovingStudents(studentsToMove);
        setStudentsWaitingForMoving(studentsToMove);
        removeMovingStudentsFromTheirOriginalAssingmentsLatestDoers();

        placeNewStudentsOnMapWhichAreNotThereYetButNowShouldBe();
    }

    function placeNewStudentsOnMapWhichAreNotThereYetButNowShouldBe() {

        for (var i = 0; i < students.length; i++) {
            var student = students[i];
            var lastDoneAssignment = student.lastDoneAssignment;

            if (lastDoneAssignment) {
                var destinationAssignment = assignments[lastDoneAssignment.number - 1];

                if (! AssignmentLatestDoersService.originalAssignment(student, assignments) &&
                    AssignmentLatestDoersService.studentShouldBeInLatestDoersOfAssignment(student, destinationAssignment)) {

                    var endPosition = AssignmentLatestDoersService.nextPositionToMoveToAroundAssignment(student, destinationAssignment);

                    var waitTime = setTimeout(function() {
                        markAssignmentAsDone(student, destinationAssignment, endPosition);
                        createStudentCircleInPosition(student, endPosition);

                        clearTimeout(waitTime);

                    }, intervalLength / 2); // wait for a little while so that we get the studentCircles in movingQueue for each student first

                    console.log("assignment after placing a new student:");
                    console.log(destinationAssignment);
                }
            }
        }
    }

    function createStudentCircleInPosition(student, scaledPosition) {
        var circle = new paper.Path.Circle(new paper.Point(scaledPosition.x, scaledPosition.y), MapScaleService.scaleByDefaultWidth(15));
        circle.fillColor = StudentIconService.colorOfCircleOfStudent(student);
        studentLayer.addChild(circle);

        paper.view.update();
    }    

    function movingStudents() {
        var movingStudents = [];

        for (var i = 0; i < students.length; i++) {
            var student = students[i];
            var lastDoneAssignment = student.lastDoneAssignment;

            if (lastDoneAssignment) {
                var destinationAssignment = assignments[lastDoneAssignment.number - 1];
                var originalAssignment = AssignmentLatestDoersService.originalAssignment(student, assignments); // undefined if not shown anywhere in map

                if (originalAssignment &&
                    originalAssignment != destinationAssignment &&
                    ! AssignmentLatestDoersService.studentIsInLatestDoersOfAssignment(student, destinationAssignment) &&
                    AssignmentLatestDoersService.studentShouldBeInLatestDoersOfAssignment(student, destinationAssignment)) {

                    movingStudents.push(student);
                }
            }
        }
        return movingStudents;
    }

    function setStudentsWaitingForMoving(movingStudents) {
        for (var i = 0; i < movingStudents.length; i++) {
            var student = movingStudents[i];
            var lastDoneAssignment = student.lastDoneAssignment;
            var originalAssignment = AssignmentLatestDoersService.originalAssignment(student, assignments);
            var destinationAssignment = assignments[lastDoneAssignment.number - 1];

            placeStudentToWait(student, originalAssignment, destinationAssignment, movingStudents.length);
        }

        lastWaitTime = 0;
    }

    function placeStudentToWait(student, originalAssignment, destinationAssignment, movingStudentsDuringInterval) {
        var time = waitingTime(movingStudentsDuringInterval);
        var circle = getStudentCircle(student, originalAssignment);
        var endPosition = AssignmentLatestDoersService.nextPositionToMoveToAroundAssignment(student, destinationAssignment);

        console.log(circle)

        var waitTillMove = setTimeout(function() {
                                console.log(circle) // miksi null?

                                placeStudentInMovingQueue(circle, student, originalAssignment, destinationAssignment, endPosition);
                                resetMovingInterval();

                                clearTimeout(waitTillMove);
                            }, time);

        lastWaitTime = time;
    }

    /*
        Eka opiskelija saa odottaa jonkin aikaa, jotta kaikki siirrettävät opiskelijat ehditään varmasti ensin
        poistaa oman originalAssignmentin latestDoersista. Tämä suoritetaan, kun kaikille opiskelijoille on määritetty
        waitTillMove = setTimeout(function() { ... }).
    */

    function waitingTime(movingStudentsDuringInterval) {
        if (lastWaitTime == 0) {
            return intervalLength / movingStudentsDuringInterval;
        }

        return lastWaitTime + intervalLength * Math.random() / movingStudentsDuringInterval;
    }

    function getStudentCircle(student, assignment) {
        var location = AssignmentLatestDoersService.getLocationOfStudent(student, assignment);
        return getItemFromStudentLayer(location);
    }

    function placeStudentInMovingQueue(circle, student, originalAssignment, destinationAssignment, endPosition) {
        var movingInfo = {'circle': circle,
                          'originalAssignment': originalAssignment,
                          'destinationAssignment': destinationAssignment,
                          'startPosition': circle.position,
                          'endPosition': endPosition,
                          'student': student,
                          'speed': minSpeed }; // vakionopeus alussa kaikilla sama

        movingQueue.push(movingInfo);
    }

    function setLeavingAttributesForAssignmentsLatestDoersMovingStudents(movingStudents) {
        for (var i = 0; i < movingStudents.length; i++) {
            var student = movingStudents[i];

            var lastDoneAssignment = AssignmentLatestDoersService.originalAssignment(student, assignments);
            AssignmentLatestDoersService.setStudentToLeaveItsLastDoneAssignment(student, lastDoneAssignment);
        }
    }

    function removeMovingStudentsFromTheirOriginalAssingmentsLatestDoers(movingStudents) {
        for (var i = 0; i < movingStudents.length; i++) {
            var student = movingStudents[i];

            var lastDoneAssignment = AssignmentLatestDoersService.originalAssignment(student, assignments);
            removeStudentFromLatestDoersOfAssignment(student, lastDoneAssignment);
        }
    }

    /*
        Poistaa opiskelijan assignmentin latestDoersista ja asettaa tilalle toisen, jos kukaan muu ei ole
        tämän positiota varannut, ja on olemassa sellainen opiskelija, joka on ko. assignmentin viimeksi tehnyt
        ja ei tällä hetkellä latestDoersissa mukana.
    */

    function removeStudentFromLatestDoersOfAssignment(student, originalAssignment) {
        var positionReserved = AssignmentLatestDoersService.removeStudentFromLatestDoersOfAssignment(student, originalAssignment);
        
        if (! positionReserved) {
            var studentToAdd = AssignmentLatestDoersService.studentToAddInPlaceOfRemovedOne(originalAssignment, students);

            console.log(studentToAdd)

            if (studentToAdd) {
                var scaledPosition = AssignmentLatestDoersService.getLocationOfStudent(student, originalAssignment);

                AssignmentLatestDoersService.addStudentToLatestDoersWithLocation(studentToAdd, originalAssignment, scaledPosition);
                createStudentCircleInPosition(studentToAdd, scaledPosition);
            }
        }
    }    

    /*
        Tehtävän merkkaaminen tehdyksi toimii siten että opiskelija merkitään uuden assignmentin latestDoersiin, josta
        mahdollisesti poistetaan toinen samaan aikaan.
        Lisäksi lisätään opiskelija tehtävän tekijöihin ja päivitetään saavutettavan assignmentcirclen ulkonäköä.
    */

    function markAssignmentAsDone(student, assignment, position) {
        putStudentToLatestDoersOfAssignment(student, assignment, position);

        assignment.doers.push(student);
        AssignmentCirclesService.updateCircleAfterNewDoer(assignment, students, assignmentLayer, percentageLayer);
    }

    /*
        Yrittää poistaa opiskelijan assignmentin latestDoersista. Mikäli poisto-operaatio onnistuu ja palauttaa 'true',
        poistetaan kartalta myös poistettavaa opiskelijaa vastaava circle.

        Lopuksi asetetaan uusi opiskelija assignmentin latestDoersiin.
    */

    function putStudentToLatestDoersOfAssignment(student, assignment, scaledPosition) {
        console.log("putStudentToLatestDoersOfAssignment")

        if (AssignmentLatestDoersService.removeStudentFromLatestDoersOfAssignmentFromPosition(assignment, scaledPosition)) {
            console.log("remove")
            console.log(scaledPosition)

            removeItemFromPosition(scaledPosition);
        }

        AssignmentLatestDoersService.addStudentToLatestDoersWithLocation(student, assignment, scaledPosition);
    }

    function removeItemFromPosition(scaledPosition) {
        var item = getItemFromStudentLayer(scaledPosition);

        if (item) {
            item.remove();
            paper.view.update();
        }

        else {
            console.log("item to remove not found")
        }
    }
    
    function getItemFromStudentLayer(location) {
        var hitTest = studentLayer.hitTest(location);

        if (hitTest) {
            return hitTest.item;
        }
        return null;
    }


    /*
        Resetoi aikavälin, jolloin studenteja liikutetaan eteenpäin.
        Jos liikutettavia on vielä jäljellä, luo uuden intervalin, jonka sisällä
        opiskelijoita liikutetaan.
    */

    function resetMovingInterval() {
        clearInterval(movingInterval);

        if (movingQueue.length > 0) {
            setMovingInterval();
        }
    }

    /*
        Määrittää ajanjakson, jonka välein 'movingQueue':ssä olevia opiskelijoita liikutetaan eteenpäin
        sekä toiminnallisuuden liikkumiseen.
    */

    function setMovingInterval() {

        movingInterval = setInterval(function() {
            var elem = movingQueue.shift(); // pop from queue

            var circleToMove = elem.circle;
            var startPosition = elem.startPosition;
            var endPosition = elem.endPosition;

            if (MoveStudentCircleService.hasReachedDestination(circleToMove, endPosition)) {
                var student = elem.student;
                var originalAssignment = elem.originalAssignment;
                var destinationAssignment = elem.destinationAssignment;

                console.log(student.id + " reached destination")

                markAssignmentAsDone(student, destinationAssignment, endPosition);

                circleToMove.position = endPosition;
                paper.view.update();

                resetMovingInterval(); // alusta interval, koska yksi pääsi perille
            }

            else {
                var newSpeed = MoveStudentCircleService.moveCircle(circleToMove, startPosition, endPosition, elem.speed);
                elem.speed = newSpeed;

                movingQueue.push(elem);
            }
        }, 1000 / (60 * movingQueue.length))
    }
})