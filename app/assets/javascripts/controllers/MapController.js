ProgressApp.controller('MapController',	function($scope, $http, $log) {

		$http.get('/map/init.json', { params: { course_id: 1, user_id: 2 } }).success(function(data, status, headers, config) {

      $scope.course = data["course"][0]

      $scope.assignments = data["assignments"]
      $scope.participants = data["participants"]

      for (var i = 0; i < $scope.assignments.length - 1; i++) {

        var x1 = $scope.assignments[i].location.x
        var y1 = $scope.assignments[i].location.y
        var x2 = $scope.assignments[i+1].location.x
        var y2 = $scope.assignments[i+1].location.y
	
        drawQuadratic(x1, y1, x2, y2);
      }
            $scope.current_user = data["current_user"][0]
            $scope.done_assignments = doneAssignments($scope.current_user.id)
    })

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

    var ctx = document.getElementById("canvas").getContext("2d");
    ctx.fillStyle = "#6B8E23";
    ctx.fillRect(0, 0, 1000, 1000);

    function placeButtonOnLocation(x, y, button) {
        button.style.position = "absolute";
        button.style.top = y + "px";
        button.style.left = x + "px";
    }

    function drawQuadratic(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo((x1+10), (y1+10));
        ctx.quadraticCurveTo(((x2 + x1) / 2), x2, (x2+10), (y2+10));
        ctx.stroke();
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
})