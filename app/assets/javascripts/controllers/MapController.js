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
        })
    }

    $scope.markAssignmentAsUndone = function(assignment) {

        var data = {
            assignment_id: assignment.id,
            user_id: $scope.currentUser.id
        }

        httpService.postData('students_tasks/destroy', data).then(function (data) {
            var i = $scope.done_assignments.indexOf(assignment)
            $scope.done_assignments.splice(i, 1)
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

    function getCurrentUser(user_id) {
        for (var i = 0; i < $scope.participants.length; i++) {
            if ($scope.participants[i].id == user_id){
                return $scope.participants[i]
            }
        }
        throw "User not found: " +  user_id
    }

    function doneAssignments(user_id) {
        var done_assignments = []

        for (var i = 0; i < $scope.assignments.length; i++) {
            var doers = $scope.assignments[i].doers

            for (var j = 0; j < doers.length; j++) {
                if (doers[j].id == user_id) {
                    done_assignments.push($scope.assignments[i])
                }
            }
        }
        return done_assignments
    }

    $scope.viewAsStudent = function(user_id) {
        try {
            $scope.currentUser = getCurrentUser(user_id)
        }
        catch(err) {
            document.getElementById("errorMsg").innerHTML = err
        }

        $scope.done_assignments = doneAssignments(user_id)
    }

    
    $scope.assignmentCompleted = function(assignment_id) {
	    for (var i = 0; i < $scope.done_assignments.length; i++) {
		    if ($scope.done_assignments[i].id == assignment_id) {
			    return true
		    }
	   }
	   return false
    }

    function validRequest(data) {
        return data['course'][0]
    }
})