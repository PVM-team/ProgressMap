ProgressApp.controller('NewCourseController', function ($scope, $location, httpService) {

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

    $scope.removeParticipant = function (participant) {
        editLists($scope.participants, $scope.allUsers, participant)
    }

    $scope.addParticipant = function (newParticipant) {
        editLists($scope.allUsers, $scope.participants, newParticipant)
    }

    function editLists(listToRemoveFrom, listToAddTo, member){
        var index = listToRemoveFrom.indexOf(member);
        listToRemoveFrom.splice(index, 1);
        listToAddTo.push(member);
    }
})