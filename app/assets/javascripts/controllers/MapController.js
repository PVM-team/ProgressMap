ProgressApp.controller('MapController',	function($scope, MapDataService, CanvasService) {


    //creates a canvas with given height and width, parent div-element and given background color
    CanvasService.initiateCanvas(1000, 1000, document.getElementById("mapElements"), "#F7CCEF");

    MapDataService.initMap().then(function(data) {
        $scope.course = data["course"][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]

        $scope.current_user = data["current_user"][0]
        $scope.done_assignments = doneAssignments($scope.current_user.id)

        CanvasService.drawSmoothPaths(getLocations());
    })

    //osa pitäisi siirtää palvelun puolelle?
    $scope.addStudent = function(course) {

        jQuery.ajax({
            url: '/users',
            data: "course_id=" + course.id,
            type: 'POST',

            success: function(data) {
                $scope.participants.push(data)
                $scope.$apply()
            }
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

    function getCurrentUser(userId) {
        for (var i = 0; i < $scope.participants.length; i++) {
            if ($scope.participants[i].id == userId){
                return $scope.participants[i];
            }
        }
        throw "User not found: " +  userId;
    }

    function doneAssignments(userId) {
        var done_assignments = []

        for (var i = 0; i < $scope.assignments.length; i++) {
            var doers = $scope.assignments[i].doers

            for (var j = 0; j < doers.length; j++) {
                if (doers[j].id == userId) {
                    done_assignments.push($scope.assignments[i])
                }
            }
        }
        return done_assignments
    }

    $scope.viewAsStudent = function(userId) {
        try {
            $scope.current_user = getCurrentUser(userId)
        }
        catch(err) {
            document.getElementById("errorMsg").innerHTML = err
        }

        $scope.done_assignments = doneAssignments(userId)
    }

    
    $scope.checkIfAssignmentIsDone = function(assignmentId){
	for (var i = 0; i < $scope.done_assignments.length; i++){
		if ($scope.done_assignments[i].id == assignmentId) {
			return true;
		}
	}
	return false;
    }

})

