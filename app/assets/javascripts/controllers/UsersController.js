ProgressApp.controller('UsersController', function($scope, DataSendService, UserDataService, MapDataService) {

    UserDataService.init().then(function(data) {
        $scope.courses = data["courses"]
        $scope.users = data["users"]
    })

    $scope.addStudentToCourse = function(course_id, user_id) {

        var student = {
            course_id : course_id,
            user_id :user_id
        }


            MapDataService.initMap(course_id, user_id).then(function(data) {
                $scope.participants = data["participants"]
            })
            $scope.participants.push(student);
        }
})