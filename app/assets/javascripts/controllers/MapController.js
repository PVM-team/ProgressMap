ProgressApp.controller('MapController', function($scope, $routeParams, MapDataService, CanvasService, StateService, DataSendService) {

    //creates a canvas with given height and width, parent div-element and given background color
    CanvasService.initiateCanvas(1000, 1000, document.getElementById("mapElements"), "rgba(30, 85, 205, 0.50"); /* väri + läpinäkyvyys */

    //initiates map with given course id and current user id (currently always 2)
    MapDataService.initMap($routeParams.course_id, 2).then(function(data) {

        $scope.course = data["course"][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]

        $scope.current_user = data["current_user"][0]

        $scope.done_assignments = doneAssignments($scope.current_user.id)
        
        CanvasService.drawSmoothPaths(getLocations());
    })

    $scope.addStudent = function() {
       var courseData = {
           course_id : $scope.course.id
       }

        DataSendService.addData('/users', courseData).then(function(data){
            var newStudent = {
                id: data.id
            }
            $scope.participants.push(newStudent);
        })
    }

    //extracts assignment locations into an array for use when drawing the course path
    function getLocations(){
        var locations = [];
        for (var i = 0; i < $scope.assignments.length; i++){
            locations.push([$scope.assignments[i].location.x, $scope.assignments[i].location.y]);
        }
        return locations;
    }

    function getCurrentUser(user_id) {
        for (var i = 0; i < $scope.participants.length; i++) {
            if ($scope.participants[i].id == user_id){
                return $scope.participants[i];
            }
        }
        throw "User not found: " +  user_id;
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
            $scope.current_user = getCurrentUser(user_id)
        }
        catch(err) {
            document.getElementById("errorMsg").innerHTML = err
        }

        $scope.done_assignments = doneAssignments(user_id)
    }

    
    $scope.assignmentCompleted = function(assignment_id){
	for (var i = 0; i < $scope.done_assignments.length; i++){
		if ($scope.done_assignments[i].id == assignment_id) {
			return true;
		}
	}
	return false;
    }

})