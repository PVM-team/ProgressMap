ProgressApp.controller('EditCourseController', function($scope, $routeParams, $location, StateService, httpService) {

    httpService.getData('courses/show', { params: { course_id: $routeParams.course_id }}).then(function(data) {
        if (! validRequest(data)) {
            $location.path("/")     // ei lopeta suoritusta täällä - ei ole siis 'jump' koodi vaan 'call'
            return;
        }

        $scope.course = data['course'][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]
        $scope.allUsers = data['all_users']

        $scope.name = $scope.course.name

        removeParticipantsFromAllUsers()
    })

    $scope.goToCoursePage = function() {
        $location.path("/map/" + $scope.course.id)
    }

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

    $scope.deleteAssignment = function(assignment) {
        var index = $scope.assignments.indexOf(assignment)

        httpService.deleteData('assignments/' + assignment.id).then(function (data) {
            $scope.assignments.splice(index, 1);
        })
    }    

    $scope.addParticipant = function(newParticipant) {
        postParticipantData("", newParticipant, $scope.allUsers, $scope.participants)
    }

    $scope.deleteParticipant = function(participant) {
        postParticipantData('/destroy', participant, $scope.participants, $scope.allUsers)
    }

    function postParticipantData(uri, participant, list_to_remove, list_to_add) {
        var index = list_to_remove.indexOf(participant)

        var data = {
            course_id: $scope.course.id,
            user_id: participant.id
        }

        httpService.postData('memberships' + uri, data).then(function (data) {
            list_to_remove.splice(index, 1);
            list_to_add.push(participant);
        })
    }

    function removeParticipantsFromAllUsers() {

        for (var i = 0; i < $scope.participants.length; i++) {
            var v = $scope.participants[i];
            var found = false;

            for (var m = 0; m < $scope.allUsers.length; m++) {

                if (v.id == $scope.allUsers[m].id) {
                    $scope.allUsers.splice(m, 1);
                }
            }
        }     
    }

    function validRequest(data) {
        return data['course'][0]
    }
})