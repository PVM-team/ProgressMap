ProgressApp.controller('EditCourseController', function($scope, $routeParams, $location, StateService, httpService) {

//KOKEILU datan haku ketjutettu, jotta oltaisiin varmoja, että participantit ja alluserit ollaan haettu ennenkuin allusereista poistetaan participantit
//jostain mysteerisestä syystä alluUserit tulostuu kahteen kertaan. Kommenteissa olevat loopit poistavat allusereista participantit
    
    httpService.getData('courses/show', { params: { course_id: $routeParams.course_id }}).then(function(data) {
        $scope.course = data['course']
        $scope.assignments = data["assignments"]
        $scope.participants = data["participants"]
    
    }).then(function() {
        httpService.getData('/users/all', {}).then(function(data2) {
            $scope.allUsers = data2['users']
          
          /*  for (var i = 0, l = $scope.participants.length; i < l; i++) {
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
            }*/
        })
    })

    $scope.editCourseName = function() {
        var data = {
            course_id: $scope.course.id,
            name: $scope.name
        }

        httpService.editData('/courses/edit_name', data).then(function (data) {
            $scope.course.name = data['course'].name
        });
    }

    $scope.addAssignment = function() {
        $scope.assignments.push({id: 'new'});
    }

    //KOKEILU! poistaa SCOPEN allusersista lisättävän osallistujan, jotta etsintä ei ehdottaisi jo kurssilla olevia henkilöitä
    $scope.addParticipant = function(newParticipant) {
        var index = $scope.allUsers.indexOf(newParticipant);
        $scope.allUsers.splice(index, 1);
        $scope.participants.push(newParticipant);
    }

    $scope.deleteAssignment = function(id) {
        for (var i = 0, l = $scope.assignments.length; i < l; i++) {
            if ($scope.assignments[i].id == id) {
                $scope.assignments.splice(i, 1);
                break;
            }
        }
    }

    $scope.deleteParticipant = function(user) {
        $scope.participants.splice($scope.participants.indexOf(user), 1);
        $scope.allUsers.push(user);
    }
})