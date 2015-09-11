ProgressApp.controller('MapController',	function($scope, $http) {

		$http.get('/map/index.json', { params: { course_id: 1} }).success(function(data, status, headers, config) {

      $scope.course = data["course"][0]
      $scope.assignments = data["assignments"]
      $scope.locations = data["locations"]
      $scope.participants = data["participants"]
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
        ctx.moveTo((x1), (y1));
        ctx.quadraticCurveTo(((x2 + x1) / 2), x2, (x2), (y2));
        ctx.stroke();
    }

    function createButton(parentDiv) {
        var button = document.createElement("BUTTON");
        var buttonText = document.createTextNode("test");
        button.appendChild(buttonText);
        parentDiv.appendChild(button);

        return button;
    }

    for (location in $scope.locations) {
        alert("!");
        var button = createButton(document.getElementById("mapElements"));
        placeButtonOnLocation(location.x, location.y, button);
    }

})