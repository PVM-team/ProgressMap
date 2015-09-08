ProgressApp.controller('MapController', [
   '$scope', '$http', '$log',

   	function($scope, $http) {

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
    }
])