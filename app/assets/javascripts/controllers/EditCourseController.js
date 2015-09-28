ProgressApp.controller('EditCourseController', function($scope, $routeParams, $location, StateService, httpService) {

    httpService.getData('courses/show', { params: { course_id: $routeParams.course_id }}).then(function(data) {
        $scope.course = data['course'][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]
        $scope.allUsers = data['all_users']

        removeParticipantsFromAllUsers()
    })

    $scope.editCourseName = function() {
        var data = {
            course_id: $scope.course.id,
            name: $scope.name
        }

        httpService.putData('/courses/edit_name', data).then(function (data) {
            $scope.course.name = data['course'].name
        })
    }

    $scope.addAssignment = function() {
        var data = {
            course_id: $scope.course.id
        }

        httpService.postData('assignments', data).then(function (data) {
            $scope.assignments.push(data['assignment'][0]);
        })
    }

    $scope.addParticipant = function(newParticipant) {
        var index = $scope.allUsers.indexOf(newParticipant)

        var data = {
            course_id: $scope.course.id,
            user_id: newParticipant.id
        }

        httpService.postData('memberships', data).then(function (data) {
            $scope.allUsers.splice(index, 1)
            $scope.participants.push(newParticipant)
        })
    }

    $scope.deleteAssignment = function(assignment) {
        var index = $scope.assignments.indexOf(assignment)

        httpService.deleteData('assignments/' + assignment.id).then(function (data) {
            $scope.assignments.splice(index, 1);
        })
    }

    $scope.deleteParticipant = function(user) {
        var index = $scope.participants.indexOf(user)

        var data = {
            course_id: $scope.course.id,
            user_id: user.id
        }

        httpService.postData('memberships/destroy', data).then(function (data) {
            $scope.participants.splice(index, 1);
            $scope.allUsers.push(user);
        })
    }

    function removeParticipantsFromAllUsers() {
            
        for (var i = 0; i < $scope.participants.length; i++) {
            var v = $scope.participants[i];
                
            for (var m = 0; m < $scope.allUsers.length; m++) {

                if (v.id == $scope.allUsers[m].id) {
                    $scope.allUsers.splice(m, 1);
                }
            }
        }        
    }
})
