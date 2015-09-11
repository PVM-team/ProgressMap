ProgressApp.controller('MapController',	function($scope, $http, $log) {

		$http.get('/map/init.json', { params: { course_id: 1 } }).success(function(data, status, headers, config) {

      $scope.course = data["course"][0]

      $scope.assignments = data["assignments"]
      $scope.locations = data["locations"]
      $scope.participants = data["participants"]

      for (var i = 0; i < $scope.locations.length - 1; i++) {
        var x1 = $scope.locations[i].x;
        var y1 = $scope.locations[i].y;
        var x2 = $scope.locations[i+1].x;
        var y2 = $scope.locations[i+1].y;
	
        drawQuadratic(x1, y1, x2, y2);
      }
    })

    $http.get('/map/view_as_user.json', { params: { user_id: 1, course_id: 1 } })
                .success(function(data, status, headers, config) {

        $scope.current_user = data['current_user']
        $scope.done_assignments = data["done_assignments"]
        $scope.done_assignment_locations = data["done_assignment_locations"]

        $scope.undone_assignment_locations = null
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

    $scope.viewAsStudent = function(user_id) {

      $http.get('/map/view_as_user.json', 
                { params: { user_id: user_id, course_id: $scope.course.id } })
                .success(function(data, status, headers, config) {

        $scope.current_user = data["current_user"]
        $scope.done_assignments = data["done_assignments"]
        $scope.done_assignment_locations = data["done_assignment_locations"]
      })
    }
})