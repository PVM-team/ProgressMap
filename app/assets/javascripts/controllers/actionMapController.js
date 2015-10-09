ProgressApp.controller('actionMapController', function ($scope, $routeParams, $location, httpService, CanvasService, StateService, $interval) {

    //never uses [0] unless there is an assignment with that number value!
    $scope.latestDoersForAssignments = [];


    httpService.getData('/map/init.json', {
        params: {
            course_id: $routeParams.course_id,
        }
    }).then(function (data) {

        $scope.course = data["course"][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]

        var assignmentLocations = getLocations();
        CanvasService.initiateCanvas(1000, 1000, document.getElementById("actionMapElements"), "rgba(30, 85, 205, 0.50");

        CanvasService.drawSmoothPaths(assignmentLocations);

        initializeLatest();
        placeStudents();
    })
    
    // calls updateLatestAssignments every 1 sec
   $interval(function() {
       updateLatestAssignments();
   }, 1000);

    $scope.goToNormalMap = function() {
        $location.path('/map/' + $scope.course.id)
    }

    function updateLatestAssignments() {
        console.log("moi");
    }

    function initializeLatest(){
        //create an empty array +1 longer than scope.assignments
        for (var i = 0; i <= $scope.assignments.length; i++){
            $scope.latestDoersForAssignments.push({});
        }
        //create empty lists of students and their locations and save the location
        //of the assignment the number of which corresponds with a given index in latestDoersForAssignments
        for (var i = 0; i < $scope.assignments.length; i++){
            $scope.latestDoersForAssignments[$scope.assignments[i].number] =
                {listOfStudentLocations: [], location: $scope.assignments[i].location};
        }
    }

    function placeStudents() {
        for (var i = 0; i < $scope.participants.length; i++) {
            var lastAssignmentDone = getLatestAssignment($scope.participants[i]);
            if (lastAssignmentDone){
                $scope.latestDoersForAssignments[lastAssignmentDone.number].listOfStudentLocations
                    .push({student: $scope.participants[i], x: 0, y: 0, timestamp: lastAssignmentDone.timestamp});
            }}

        for (var i = 1; i < $scope.latestDoersForAssignments.length; i++){
            $scope.latestDoersForAssignments[i].listOfStudentLocations.sort(function(a, b){
                var timeA = new Date(a.timestamp), timeB = new Date(b.timestamp)
                return timeA-timeB
            })
        }

        placeStudentsInCircle();
    }

    function getLatestAssignment(user) {
        var latestAssignment;

        for (var i = 0; i < $scope.assignments.length; i++) {
            var assignmentInfo = $scope.assignments[i].students_tasks;

            for (var j = 0; j < assignmentInfo.length; j++) {
                if (assignmentInfo[j].user_id == user.id){
                    if (!latestAssignment){
                        latestAssignment = {location: $scope.assignments[i].location, number: $scope.assignments[i].number, timestamp: assignmentInfo[j].timestamp};

                    } else if (latestAssignment.timestamp < assignmentInfo[j].timestamp){
                        latestAssignment = {location: $scope.assignments[i].location, number: $scope.assignments[i].number, timestamp: assignmentInfo[j].timestamp};
                    }
                }
            }
        }
        return latestAssignment;
    }

    function placeStudentsInCircle(){
        var assignmentButtonWidth = 50;
        var assignmentButtonHeight = 50;
        var buttonRadius = 35;
        for (var i = 1; i <  $scope.latestDoersForAssignments.length; i++){
            var items = $scope.latestDoersForAssignments[i].listOfStudentLocations.length;
            var step = (2 * Math.PI) / items;
            var angle = 0;
            var x0 = $scope.latestDoersForAssignments[i].location.x - 25;
            var y0 = $scope.latestDoersForAssignments[i].location.y - 25;
            for (var j = 0; j < items; j++){
                $scope.latestDoersForAssignments[i].listOfStudentLocations[j].x = x0 +
                    assignmentButtonWidth/2 + buttonRadius * Math.cos(angle) - 10;
                $scope.latestDoersForAssignments[i].listOfStudentLocations[j].y = y0 +
                    assignmentButtonHeight/2 + buttonRadius * Math.sin(angle) - 10;
                angle += step;
            }
        }
    }

    function getLocations() {
        var locations = []

        for (var i = 0; i < $scope.assignments.length; i++) {
            locations.push([$scope.assignments[i].location.x, $scope.assignments[i].location.y])
        }
        return locations
    }


});
