ProgressApp.controller('EditCourseController', function($scope, $routeParams, $location, StateService, httpService) {

//KOKEILU datan haku ketjutettu, jotta oltaisiin varmoja, että participantit ja alluserit ollaan haettu ennenkuin allusereista poistetaan participantit
    
    httpService.getData('courses/show', { params: { course_id: $routeParams.course_id }}).then(function(data) {
        $scope.course = data['course'][0]
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]
    
    }).then(function() {
        httpService.getData('/users/all', {}).then(function(data2) {
            $scope.allUsers = data2['users']
//          console.log($scope.allUsers);
               for (var i = 0, l = $scope.participants.length; i < l; i++) {
                var v = $scope.participants[i];
                if (v){
                    for (var m = 0, l = $scope.allUsers.length; m < l; m++) {
                        if ($scope.allUsers[m]) {
                            if (v.id == $scope.allUsers[m].id) {
                                $scope.allUsers.splice(m, 1);
                            }
                        } 
                    }
                }   
            } 
        })
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

    //KOKEILU! poistaa SCOPEN allusersista lisättävän osallistujan, jotta etsintä ei ehdottaisi jo kurssilla olevia henkilöitä
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

    $scope.deleteAssignment = function(assignment_id) {
        for (var i = 0, l = $scope.assignments.length; i < l; i++) {
            if ($scope.assignments[i].id == assignment_id) {
                $scope.assignments.splice(i, 1);
                break;
            }
        }

        httpService.deleteData('assignments/' + assignment_id).then(function (data) {
        })
    }

    $scope.deleteParticipant = function(user) {
        $scope.participants.splice($scope.participants.indexOf(user), 1);
        $scope.allUsers.push(user);

        var data = {
            course_id: $scope.course.id,
            user_id: user.id
        }

        httpService.postData('memberships/destroy', data).then(function (data) {
        })        
    }
})
