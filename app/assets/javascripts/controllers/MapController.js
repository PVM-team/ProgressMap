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
})