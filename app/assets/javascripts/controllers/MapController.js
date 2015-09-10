ProgressApp.controller('MapController',	function($scope, $http) {

		$http.get('/map/index.json', {
      params: { course_id: 1}
    }).success(function(data, status, headers, config) {

    	var c = data["course"]
      var a = data["assignments"]
      var p = data["participants"]
      var l = data["locations"]

      $scope.course = c[0]
      $scope.assignments = createTable(a)
      $scope.locations = createTable(l)
      $scope.participants = createTable(p)
    })
    
    this.createTable = function(json_array) {
      var table = []

      for (var i = 0; i < json_array.length; i++) {
        table.push(json_array[i])
      }

     return table;
    }

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
})
