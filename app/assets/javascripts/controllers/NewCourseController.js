ProgressApp.controller('NewCourseController', function($scope, $http, $location, StateService) {

    $scope.form = {}

    $scope.createCourse = function() {
        var name = $scope.form.name
        var assignmentCount = $scope.form.assignmentCount

        if (name && validAssignmentCount(assignmentCount)) {
            var sendData = {
                name: name,
                assignment_count: assignmentCount
            }
        
            $http.post('/courses', sendData).success(function(data) {
                user = StateService.getCurrentUser()

                $location.path("/map/" + data.id)
            })
        }
    }

    $scope.changeCourseName = function() {
        if ($scope.form.name) {
            hideField("nameInfo")
            return;
        }
        showField("nameInfo")
    }

    $scope.changeAssignmentCount = function() {
        var count = $scope.form.assignmentCount

        if (validAssignmentCount(count)) {
            hideField("assignmentInfo")
            return;
        }

        showField("assignmentInfo")
    }

    function showField(fieldId) {
        document.getElementById(fieldId).style.display = 'inline'
    }

    function hideField(fieldId) {
        document.getElementById(fieldId).style.display = 'none'
    }

    function validAssignmentCount(count) {
        return count && count >= 0 && count < 500
    }
})