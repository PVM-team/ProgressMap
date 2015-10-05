ProgressApp.controller('MapController', function ($scope, $routeParams, $location, httpService, CanvasService, StateService) {

    $scope.buttonClicked = false;

    //korvataan joskus käyttäjän valintaruudulla?
    if (!StateService.getCurrentUser()) {
        StateService.setCurrentUser({id: 2})
    }

    //initiates map with given course id and current user id
    httpService.getData('/map/init.json', {
        params: {
            course_id: $routeParams.course_id,
            user_id: StateService.getCurrentUser().id
        }
    }).then(function (data) {

        if (!validRequest(data)) {
            $location.path("/")     // ei lopeta suoritusta täällä - ei ole siis 'jump' koodi vaan 'call'
            return;
        }

        $scope.course = data["course"][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]

        $scope.currentUser = data["current_user"][0]
        setDoneAssignments();


        var canvasWidth = 1000;
        var borderSize = canvasWidth / 40; // 25
        var blockSize = canvasWidth / 5; // 200

        var assignmentsPerLevel = canvasWidth / (2 * borderSize + blockSize) // 4, kuinka monta tehtävää on per taso

        var levelAmount = Math.ceil($scope.assignments.length / assignmentsPerLevel) // kuinka paljon tasoja tarvitaan

        //100 pixeliä lisätään reunoi varten
        CanvasService.initiateCanvas((2 * borderSize + blockSize) * levelAmount + 100, canvasWidth + 100, document.getElementById("mapElements"), "rgba(30, 85, 205, 0.50")

        CanvasService.drawSmoothPaths(getLocations())
    })

    $scope.moveToCourseCreationView = function () {
        StateService.setCurrentUser($scope.currentUser)
        $location.path("/course/new")
    }

    $scope.moveToCourseEditView = function () {
        StateService.setCurrentCourse($scope.course)
        $location.path('/course/' + $scope.course.id + '/edit')
    }

    function findAssignmentById(id) {
        for (var i = 0; i < $scope.assignments.length; i++) {
            if ($scope.assignments[i].id == id) {
                return $scope.assignments[i];
            }
        }
    }

    $scope.showDependencies = function (assignment) {
        for (var i = 0; i < assignment.dependencies.length; i++) {
            var dependent = findAssignmentById(assignment.dependencies[i].id);

            $("button:contains('" + dependent.number + "')").closest('button').addClass("dependent");
        }
    }

    $scope.hideDependencies = function (assignment) {
        for (var i = 0; i < assignment.dependencies.length; i++) {
            var dependent = findAssignmentById(assignment.dependencies[i].id);

            $("button:contains('" + dependent.number + "')").closest('button').removeClass("dependent");
        }
    }

    $scope.markAssignmentAsDone = function (assignment) {
        $scope.buttonClicked = true;

        var data = {
            assignment_id: assignment.id,
            user_id: $scope.currentUser.id
        }

        httpService.postData('students_tasks', data).then(function (data) {
            $scope.done_assignments.push(assignment)
            assignment.doers.push($scope.currentUser)

            $scope.buttonClicked = false;
        })
    }

    $scope.markAssignmentAsUndone = function (assignment) {
        $scope.buttonClicked = true;

        var data = {
            assignment_id: assignment.id,
            user_id: $scope.currentUser.id
        }

        httpService.postData('students_tasks/destroy', data).then(function (data) {
            var i = $scope.done_assignments.indexOf(assignment)
            removeValueFromList($scope.done_assignments, i)

            i = $scope.assignments.indexOf(assignment)
            var j = indexOfValueWithId($scope.assignments[i].doers, $scope.currentUser.id)

            removeValueFromList($scope.assignments[i].doers, j)

            $scope.buttonClicked = false;
        })
    }

    //extracts assignment locations into an array for use when drawing the course path
    function getLocations() {
        var locations = []

        for (var i = 0; i < $scope.assignments.length; i++) {
            locations.push([$scope.assignments[i].location.x, $scope.assignments[i].location.y])
        }
        return locations
    }

    function setDoneAssignments() {
        var done_assignments = [];

        for (var i = 0; i < $scope.assignments.length; i++) {
            var doers = $scope.assignments[i].doers;

            if (indexOfValueWithId(doers, $scope.currentUser.id) >= 0) {
                done_assignments.push($scope.assignments[i])
            }
        }
        $scope.done_assignments = done_assignments;
    }

    $scope.viewAsStudent = function (user) {
        try {
            $scope.currentUser = user;
        }
        catch (err) {
            document.getElementById("errorMsg").innerHTML = err
        }

        setDoneAssignments();
    }


    $scope.assignmentCompleted = function (assignment) {
        return ($scope.done_assignments.indexOf(assignment) >= 0)
    }

    function validRequest(data) {
        return data['course'][0]
    }

    function removeValueFromList(list, index) {
        list.splice(index, 1)
    }

    // $scope.currentUser ja assignment.doers-jäsenet eivät ole tallenettu samalla tavalla, käyttäjä ei löydy suoralla vertailulla (etsitään id:n perusteella)
    function indexOfValueWithId(list, id) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                return i;
            }
        }

        return -1;
    }
})