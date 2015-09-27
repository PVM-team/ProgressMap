ProgressApp.controller('NewCourseController', function ($scope, $location, httpService, StateService) {

    $scope.participants = []

    httpService.getData('/users/all', {}).then(function (data) {
        $scope.allUsers = data['users']
    })

    $scope.createCourse = function () {

        var newCourse = {
            name: $scope.name,
            assignment_count: $scope.assignmentCount,
            participants: $scope.participants
        }

        httpService.postData('/courses', newCourse).then(function (data) {
            var path = "/map/" + data.id
            $location.path(path)
        })
    }

    $scope.removeParticipant = function(participant) {
        var index = $scope.participants.indexOf(participant)
        $scope.participants.splice(index, 1)
    }

    $scope.addParticipant = function (newParticipant) {
        if ($scope.participants.indexOf(newParticipant) == -1) {
            $scope.participants.push(newParticipant)
        }
    }
})