ProgressApp.controller('MapController',	function($scope, $http, $log) {

		$http.get('/map/index.json', {
       		params: { course_id: 1}
       	}).success(function(data, status, headers, config) {

    		  var c = data["course"]
       		var a = data["assignments"]
       		var p = data["participants"]
       		var l = data["locations"]

       		$scope.course = c[0]
        	$scope.assignments = []
        	$scope.locations = []
        	$scope.participants = []

        	for (var i = 0; i < a.length; i++) {
        		$scope.assignments.push(a[i])
        	}

        	for (var i = 0; i < l.length; i++) {
        		$scope.locations.push(l[i])
        	}

        	for (var i = 0; i < p.length; i++) {
        		$scope.participants.push(p[i])
        	}

    	})
    

      $scope.addStudent = function(course) {

        $log.log("addStudent called")
    
        $http.post('/users', {
          params: { course_id: course.id }
        })
      }
  }
);

