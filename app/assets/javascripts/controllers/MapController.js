ProgressApp.controller('MapController', function($scope, $routeParams, $location, httpService, CanvasService, StateService) {

    //creates a canvas with given height and width, parent div-element and given background color
    CanvasService.initiateCanvas(1000, 1000, document.getElementById("mapElements"), "rgba(30, 85, 205, 0.50") /* väri + läpinäkyvyys */

    //korvataan joskus käyttäjän valintaruudulla?
    if (!StateService.getCurrentUser()) {
        StateService.setCurrentUser({id: 2})
    }

    //initiates map with given course id and current user id
    httpService.getData('/map/init.json', { params: { course_id: $routeParams.course_id, user_id: StateService.getCurrentUser().id }}).then(function(data) {
        
        if (! validRequest(data)) {
            $location.path("/")     // ei lopeta suoritusta täällä - ei ole siis 'jump' koodi vaan 'call'
            return;
        }

        $scope.course = data["course"][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]

        $scope.currentUser = data["current_user"][0]
        $scope.done_assignments = doneAssignments($scope.currentUser.id)

        CanvasService.drawSmoothPaths(getLocations())
    })

    $scope.moveToCourseCreationView = function() {
        StateService.setCurrentUser($scope.currentUser)
        $location.path("/course/new")
    }
    
    $scope.moveToCourseEditView = function() {
        StateService.setCurrentCourse($scope.course)
        $location.path('/course/' + $scope.course.id + '/edit')
    }

    $scope.markAssignmentAsDone = function(assignment) {

        var data = {
            assignment_id: assignment.id,
            user_id: $scope.currentUser.id
        }

        httpService.postData('students_tasks', data).then(function (data) {
            $scope.done_assignments.push(assignment)

            assignment.doers.push($scope.currentUser)
        })
    }

    $scope.markAssignmentAsUndone = function(assignment) {

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

    function getCurrentUser(userId) {
        var i = indexOfValueWithId($scope.participants, userId)

        if (i >= 0) {
            return $scope.participants[i]
        }

        throw "User not found: " +  user
    }

    function doneAssignments(userId) {
        var done_assignments = []

        for (var i = 0; i < $scope.assignments.length; i++) {
            var doers = $scope.assignments[i].doers

            if (listHasValueWithId(doers, userId)) {
                done_assignments.push($scope.assignments[i])
            }
        }
        return done_assignments
    }

    $scope.viewAsStudent = function(user) {
        try {
            $scope.currentUser = getCurrentUser(user.id)
        }
        catch(err) {
            document.getElementById("errorMsg").innerHTML = err
        }

        $scope.done_assignments = doneAssignments(user.id)
    }

    
    $scope.assignmentCompleted = function(assignment) {
        return listHasValueWithId($scope.done_assignments, assignment.id)
    }

    function validRequest(data) {
        return data['course'][0]
    }

    function removeValueFromList(list, index) {
        list.splice(index, 1)
    }

    function listHasValueWithId(list, id) {
        return (indexOfValueWithId(list, id)) >= 0
    }

    // indexOf ei toimi taulukoiden kanssa joka sisältää objekteja, kun verrattava objekti on { } -sisällä.
    function indexOfValueWithId(list, id) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                return i;
            }
        }

        return -1;
    }
})