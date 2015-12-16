ProgressApp.service('ActionMapUpdaterService', function (GravatarService, AssignmentLatestAttemptersService, AssignmentCirclesService, MapScaleService, MoveStudentIconService) {

    var new_assignments; // tehtävälistä joka saadaan parametrina intervalia kutsuttaessa

    var assignments; // muotoa {'id', 'number', 'location': {'x', 'y'}, latestAttempters: {'id', 'location', 'reserved', 'leaving', 'dummy'}}
                     // latestAttemptersissa jokaisella tulee olla aina id ja location. Muut attribuutit ovat tilanteesta riippuen olemassa tai sitten ei, jos niitä ei ko. doerin kohdalla tarvita

                     // reserved = "'true', jos toinen opiskelija on varannut tämän opiskelijan position ja liikkuu tämän paikalle ko. intervalin aikana"
                     // leaving = "'true' jos tämä opiskelija siirtyy ko. intervalin aikana. on olemassa uusien siirtymälokaatioiden määrityksen aikana olemassa."
                     // dummy = "määritelty ja 'true', mikäli assignmentilla ei ole oikeasti tätä tekijää, mutta joku liikkuu tämän positioon ja on tehnyt siihen jo varauksen. tarvitaan myöhemmin tietona siitä, tuleeko kartalta poistaa 'circle' tämän positiosta. ei luonnollisesti poisteta circleä, jos dummy = true, sillä "dummy = true" tarkoittaa että kartalla ei ole tämän positiossa mitään.


    var students; // muotoa: {'id', 'lastDoneAssignment': {'number', 'timestamp', 'complete'}, 'originalAssignment': {'number', 'timestamp'}}
                  // studentit sisältävät näemmä myös tietoa 'reserved' sekä 'leaving' arvoista, sillä ne ovat viitteinä assignmenteissa eivätkä kopioina

    var readyForNextUpdate = true; // true mikäli ketään ei odotus- eikä liikkumisjonoissa

    var studentsWhichAreNotShownOnTheMapMoved = false; // boolean muuttuja, joka kertoo, onko tämän intervalin aikana jo liikutettu henkilöitä jotka eivät olleet alun perin näkyvissä. liittyy 'readyForNextUpdaten' toimintaan että saadaan se pidettyä oikein 'true' tai 'false' arvoisena.

    var endlessWaitingQueue = [];
    var normalWaitingQueue = [];
    var movingQueue = [];
    var movingInterval;
    var intervalLength = 20000;
    var minSpeed = 90;
    var maxStudentsToMoveAtTheSameTime = 3; // 1 <= maxStudentsToMoveAtTheSameTime <= maxStudentsToShowAroundAssignment

    var assignmentLayer;
    var percentageLayer;
    var studentLayer;

    this.readyForNextUpdate = function() {
        return readyForNextUpdate;
    }

    /*
        Toimii väärin mikäli 3 sekunnin sisään kurssilta sekä poistetaan opiskelija että siihen lisätään uusi opiskelija.
    */

    this.amountOfStudentsHasChangedSinceLastUpdate = function(new_students) {
        if (students) {
            return students.length != new_students.length;    
        }

        return false;
    }

    this.updateAssignmentLocations = function() {
        for (var i = 0; i < assignments.length; i++) {
            assignments[i].location.x = MapScaleService.getRelativeX(assignments[i].location.x);
        }
    }

    this.updateAssignmentsLatestAttemptersLocations = function() {
        for (var i = 0; i < assignments.length; i++) {

            for (var j = 0; j < assignments[i].latestAttempters.length; j++) {
                assignments[i].latestAttempters[j].location.x = MapScaleService.getRelativeX(assignments[i].latestAttempters[j].location.x);
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

    this.update = function(new_students, new_assign) {
        new_assignments = new_assign;

        if (! students) {
            students = new_students;
            return;
        }

        readyForNextUpdate = false;
        var update = false;

        for (var i = 0; i < students.length; i++) {

            if (students[i].lastDoneAssignment != new_students[i].lastDoneAssignment) {
                students[i].originalAssignment = students[i].lastDoneAssignment;
                students[i].lastDoneAssignment = new_students[i].lastDoneAssignment;

                update = true;
            }
        }

        if (update) {
            doUpdate();
            return;
        }

        endInterval();
    }

    /*
        Päivittää tilanteen siirtämällä opiskelijoita paikoista toisiin sekä lisäämällä kartalle
        opiskelijat, jotka eivät ole tällä hetkellä näkyvissä, mutta viime intervalin aikana
        tekivät jonkin tehtävän.

        Metodin sisäiset funktiokutsut tulee suorittaa samassa järjestyksessä kuin ne ovat nytkin.
    */

    function doUpdate() {
        studentsWhichAreNotShownOnTheMapMoved = false;

        var studentsToMove = movingStudents();

        if (studentsToMove.length == 0) {
            moveStudentsWhichAreNotShownOnTheMap();
            return;
        }
        

        setLeavingAttributesForMovingStudents(studentsToMove);
        setStudentsWaitingForMoving(studentsToMove);

        removeMovingStudentsFromTheirOriginalAssingmentsLatestAttempters(studentsToMove);
    }

    function studentInMovingStudents(student, movingStudents) {
        for (var i = 0; i < movingStudents.length; i++) {
            if (student.id == movingStudents[i].id) {
                return true;
            }
        }
        return false;
    }

    function createStudentIconInPosition(student, position) {
        var icon = GravatarService.gravatarImage(student);
        icon.position = position;
        studentLayer.appendBottom(icon);

        paper.view.update();

        return icon;
    }

    function movingStudents() {
        var movingStudents = [];

        for (var i = 0; i < students.length; i++) {
            var student = students[i];
            var lastDoneAssignment = student.lastDoneAssignment;

            if (lastDoneAssignment) {
                var destinationAssignment = assignments[lastDoneAssignment.number - 1];
                var originalAssignment = AssignmentLatestAttemptersService.originalAssignment(student, assignments); // undefined if not shown anywhere in map

                if (originalAssignment &&
                    originalAssignment != destinationAssignment &&
                    AssignmentLatestAttemptersService.studentIsInLatestAttemptersOfAssignment(student, originalAssignment) &&
                    AssignmentLatestAttemptersService.studentShouldBeInLatestAttemptersOfAssignment(student, destinationAssignment)) {

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
            var destinationAssignment = assignments[lastDoneAssignment.number - 1];

            placeStudentToWait(student, destinationAssignment, i, movingStudents.length);
        }
    }

    /*
        Kaikki liikkujat laitetaan normalWaitingQueueen, mutta ainoastaan 9 ekalle määritetään 'timeout' liikkeellelähtöä
        varten. Loput, jotka eivät timeoutia saa, lähetetään liikkeelle yksi kerrallaan, kun joku liikkuva pääsee perille.
    */

    function placeStudentToWait(student, destinationAssignment, ithMover, movingStudentsDuringInterval) {
        var time = waitingTime(ithMover, movingStudentsDuringInterval);

        if (time < Number.MAX_VALUE) {
            placeStudentToWaitingQueue(student, normalWaitingQueue, destinationAssignment);


            setTimeout(function() {
                setNextStudentMoving(normalWaitingQueue);
            }, time);               
        }

        else {
            placeStudentToWaitingQueue(student, endlessWaitingQueue, destinationAssignment);
        }
    }

    /*
        Eka opiskelija saa odottaa jonkin aikaa, jotta kaikki siirrettävät opiskelijat ehditään varmasti ensin
        poistaa oman originalAssignmentin latestAttemptersista. Tämä suoritetaan, kun kaikille opiskelijoille on määritetty
        waitTillMove = setTimeout(function() { ... }).

        Viimeinen mahdollinen liikkeellelähtöaika on ajoitettu ajaksi 'intervalLength / 2', jotta opiskelija pääsee
        varmasti perille ennen kuin interval päättyy. Jos ei ehdi, niin teleporttaa seuraavan intervalin aikana ja
        ei poista vanhaa palluraa.
    */

    function waitingTime(ithMover, movingStudentsDuringInterval) {
        if (ithMover < maxStudentsToMoveAtTheSameTime) {
            return intervalLength / 20 + (ithMover / movingStudentsDuringInterval) * (intervalLength / 2);
        }
        return Number.MAX_VALUE;
    }

    /*
        Laittaa liikkujan joko normaaliin odotusjonoon, johon liittyy aikakeskeytys tai loputtomaan odotusjonoon,
        josta pääsee pois, kun joku liikkuja saapuu perille.
    */

    function placeStudentToWaitingQueue(student, queue, destinationAssignment) {
        var position = positionOfStudentIconOnMap(student);
        var icon;

        if (position) {
            icon = getItemFromStudentLayer(position);
        }

        else {
            position = positionWhereToPutMovingStudentThatIsNotShownOnTheMap(student);
            icon = createStudentIconInPosition(student, position); // ota ikoni tätä kautta äläkä hae studentLayeriltä 'getItemFromStudentLayer' funktiolla. muuten joutuu tekemään taas 'timeoutin' tms. odottaakseen ikonin latautumista
        }

        icon.bringToFront();

        var endPosition = AssignmentLatestAttemptersService.nextPositionToMoveToAroundAssignment(student, destinationAssignment);

        var movingInfo = {'icon': icon,
                          'destinationAssignment': destinationAssignment,
                          'startPosition': icon.position,
                          'endPosition': endPosition,
                          'student': student,
                          'speed': minSpeed }

        queue.push(movingInfo);
    }

    function positionOfStudentIconOnMap(student) {
        var originalAssignment = AssignmentLatestAttemptersService.originalAssignment(student, assignments);

        if (originalAssignment && AssignmentLatestAttemptersService.studentIsInLatestAttemptersOfAssignment(student, originalAssignment)) {
            return AssignmentLatestAttemptersService.getLocationOfStudent(student, originalAssignment);
        }
    }

    function positionWhereToPutMovingStudentThatIsNotShownOnTheMap(student) {
        var originalAssignment = AssignmentLatestAttemptersService.originalAssignment(student, assignments);

        if (originalAssignment) { // tehnyt ainakin yhden tehtävän kurssin aikana
            return randomPositionCloseToLocation(originalAssignment.location);
        }

        var location = {'x': assignments[0].location.x - 50, 'y': assignments[0].location.y + 50};
        return randomPositionCloseToLocation(location); // korvaa 'START' ruudulla?
    }

    /*
        Hae queue:sta sitä studentia koskeva movingInfo, joka aiheutti 'timeout' keskeytyksen (ko. movingInfo
        sattuu olemaan aina ensimmäisenä).
        Tämän jälkeen laita movingInfo movingQueueen ja aloita movingInfoa koskevan studentCirclen liikuttaminen
        resetMovingIntervalilla.
    */

    function setNextStudentMoving(queue) {
        var movingInfo = queue.shift(); // pop first

        movingQueue.push(movingInfo);
        resetMovingInterval();
    }

    function setLeavingAttributesForMovingStudents(movingStudents) {
        for (var i = 0; i < movingStudents.length; i++) {
            var student = movingStudents[i];

            var originalAssignment = AssignmentLatestAttemptersService.originalAssignment(student, assignments);
            AssignmentLatestAttemptersService.setStudentToLeaveItsLastDoneAssignment(student, originalAssignment);
        }
    }

    function removeMovingStudentsFromTheirOriginalAssingmentsLatestAttempters(movingStudents) {
        for (var i = 0; i < movingStudents.length; i++) {
            var student = movingStudents[i];

            var originalAssignment = AssignmentLatestAttemptersService.originalAssignment(student, assignments);
            removeStudentFromLatestAttemptersOfAssignment(student, originalAssignment);
        }
    }

    /*
        Poistaa opiskelijan assignmentin latestAttemptersista ja asettaa tilalle toisen, jos kukaan muu ei ole
        tämän positiota varannut, ja on olemassa sellainen opiskelija, joka on ko. assignmentin viimeksi tehnyt
        ja ei tällä hetkellä latestAttemptersissa mukana.
    */

    function removeStudentFromLatestAttemptersOfAssignment(student, originalAssignment) {
        var attempter = AssignmentLatestAttemptersService.removeStudentFromLatestAttemptersOfAssignment(student, originalAssignment);

        if (! attempter.reserved) {
            var studentToAdd = AssignmentLatestAttemptersService.studentToAddInPlaceOfRemovedOne(originalAssignment, students);

            if (studentToAdd) {
                AssignmentLatestAttemptersService.addStudentToLatestAttemptersWithLocation(studentToAdd, originalAssignment, attempter.location);
                createStudentIconInPosition(studentToAdd, attempter.location);
            }
        }
    }    

    function markAssignmentAsDone(student, assignment, position) {
        AssignmentLatestAttemptersService.addStudentToLatestAttemptersWithLocation(student, assignment, position);

        if (student.lastDoneAssignment.complete) {
            assignment.doers.push(student);
            AssignmentCirclesService.updateCircleAfterNewDoer(assignment, students, assignmentLayer, percentageLayer);
        }
    }

    /*
        Yrittää poistaa opiskelijan assignmentin latestAttemptersista. Mikäli poisto-operaatio onnistuu ja palauttaa 'true',
        poistetaan kartalta myös poistettavaa opiskelijaa vastaava circle.
    */

    function removeStudentFromEndPosition(assignment, endPosition) {
        if (AssignmentLatestAttemptersService.removeStudentFromLatestAttemptersOfAssignmentFromPosition(assignment, endPosition)) {
            removeItemFromPosition(endPosition);
        }
    }

    function removeItemFromPosition(position) {
        var item = getItemFromStudentLayer(position);

        if (item) {
            item.remove();
            paper.view.update();
        }

        else {
        }
    }
    
    function getItemFromStudentLayer(location) {
        var hitTest = studentLayer.hitTest(location);

        if (hitTest) {
            return hitTest.item;
        }
    }


    /*
        Resetoi aikavälin, jolloin studenteja liikutetaan eteenpäin.
        Jos liikutettavia on vielä jäljellä, luo uuden intervalin, jonka sisällä
        opiskelijoita liikutetaan.
    */

    function resetMovingInterval() {
        if (movingInterval) {
            clearInterval(movingInterval);
        }

        if (movingQueue.length > 0) {

            movingInterval = setInterval(function() {
                moveNextStudent();
            }, 1000 / (60 * movingQueue.length));
        }

        else if (normalWaitingQueue.length == 0 && endlessWaitingQueue.length == 0) {

            if (studentsWhichAreNotShownOnTheMapMoved) {
                endInterval();
                return;
            }
            
            moveStudentsWhichAreNotShownOnTheMap();
        }
    }


    function moveNextStudent() {
        var movingInfo = movingQueue.shift(); // pop from queue

        var icon = movingInfo.icon;
        var endPosition = movingInfo.endPosition;

        var newSpeed = MoveStudentIconService.moveIcon(icon, movingInfo.startPosition, endPosition, movingInfo.speed, minSpeed);
        movingInfo.speed = newSpeed;

        if (MoveStudentIconService.hasReachedDestination(icon, endPosition)) {
            updateViewAfterStudentHasReachedDestination(movingInfo);
            return;
        }

        else if (! movingInfo.studentRemovedFromEndPosition &&
                 MoveStudentIconService.approachingDestination(icon, endPosition)) {

            removeStudentFromEndPosition(movingInfo.destinationAssignment, endPosition);
            movingInfo.studentRemovedFromEndPosition = true;
        }

        movingQueue.push(movingInfo);
    }

    function updateViewAfterStudentHasReachedDestination(movingInfo) {
        var endPosition = movingInfo.endPosition;

        markAssignmentAsDone(movingInfo.student, movingInfo.destinationAssignment, endPosition);
        movingInfo.icon.position = endPosition;

        paper.view.update();

        if (endlessWaitingQueue.length > 0) {
            setNextStudentMoving(endlessWaitingQueue);
        }
        else {
            resetMovingInterval();
        }
    }

    function moveStudentsWhichAreNotShownOnTheMap() {
        var movingStudents = getMovingStudentsWhichAreNotShownOnTheMap();

        if (movingStudents.length == 0) {
            endInterval();
            return;
        }

        setStudentsWaitingForMoving(movingStudents);
        studentsWhichAreNotShownOnTheMapMoved = true;
    }

    function getMovingStudentsWhichAreNotShownOnTheMap() {
        var movingStudents = [];

        for (var i = 0; i < students.length; i++) {
            var student = students[i];
            var lastDoneAssignment = student.lastDoneAssignment;

            if (lastDoneAssignment) {
                var destinationAssignment = assignments[lastDoneAssignment.number - 1];
                var originalAssignment = AssignmentLatestAttemptersService.originalAssignment(student, assignments);

                if ((! originalAssignment || ! AssignmentLatestAttemptersService.studentIsInLatestAttemptersOfAssignment(student, originalAssignment)) &&
                    ! AssignmentLatestAttemptersService.studentIsInLatestAttemptersOfAssignment(student, destinationAssignment) &&
                    AssignmentLatestAttemptersService.studentShouldBeInLatestAttemptersOfAssignment(student, destinationAssignment)) {

                    movingStudents.push(student);
                }
            }
        }

        return movingStudents;
    }

    /*
        Palauttaa randomillä lokaation, jonka 'x' ja 'y' attribuutit löytyvät siltä alueelta,  jossa latestAttemptersit olisivat
        assignmentille, jonka location on saatu parametrina. Parametrina ei saada assignmenttia, sillä tätä hyödynnetään myös
        tapaukseen, jolloin henkilö tekee kurssin ekan tehtävän ja originalAssignment ei ole ko. studentille määritelty.

        Liittyy liikkumiseen, jolloin henkilö ei näy kartalla - määrittää lähtöposition, johon hlö sijoitetaan.
    */

    function randomPositionCloseToLocation(location) {
        var x = location.x + MapScaleService.getRelativeXFromDefaultSize(50 + Math.random() * 30 * 3); // 3 hlöä näytetään vierekkäin
        var y = location.y + Math.random() * 30 * 3; // 3 allekkain

        // ol. että näytetään tehtävän ympärillä maksimissaan 3x3 opiskelijaa

        return {'x': x, 'y': y};
    }

    /*
        Jokaisen intervalin suoritus päättyy tällä samalla tavalla.
    */

    function endInterval() {
        updateDoersForEachAssignment();
        readyForNextUpdate = true;
    }

    /*
        Kelataan kaikki nykyiset assignmentit läpi ja jos 'doers'ien määrä ei täsmää oikeaan tilaan (new_assignments),
        päivitetään ko. assignmentin doers.
    */

    function updateDoersForEachAssignment() {

        for (var i = 0; i < assignments.length; i++) {

            if (assignments[i].doers.length != new_assignments[i].doers.length) {
                assignments[i].doers = new_assignments[i].doers;
                AssignmentCirclesService.updateCircleAfterNewDoer(assignments[i], students, assignmentLayer, percentageLayer);
            }
        }
    }
})
