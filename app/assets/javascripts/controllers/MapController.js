ProgressApp.controller('MapController',	function($scope, MapDataService, CanvasService) {


    var canvas = CanvasService.initiateCanvas(1000, 1000);
    CanvasService.placeCanvasInMapElementsDiv(canvas);
    CanvasService.setCanvasBGColor("#F7CCEF", canvas.getContext("2d"), 1000, 1000);


    MapDataService.initMap().then(function(data) {
        $scope.course = data["course"][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]

        $scope.current_user = data["current_user"][0]
        $scope.done_assignments = doneAssignments($scope.current_user.id)

        CanvasService.drawSmoothPaths(getLocations());

        //CanvasService.drawPaths($scope.assignments);
    })

    //osa pitäisi siirtää palvelun puolelle
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

    function getLocations(){
        var locations = [];
        for (var i = 0; i < $scope.assignments.length; i++){
            locations.push([$scope.assignments[i].location.x, $scope.assignments[i].location.y]);
        }
        return locations;
    }

    function placeButtonOnLocation(x, y, button) {
        button.style.position = "absolute";
        button.style.top = y + "px";
        button.style.left = x + "px";
    }

    function createButton(parentDiv) {
        var button = document.createElement("BUTTON");
        var buttonText = document.createTextNode("test");
        button.appendChild(buttonText);
        parentDiv.appendChild(button);

        return button;
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

    $scope.getctx = function() {
        return ctx;
    }
})