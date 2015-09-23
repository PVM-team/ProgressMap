ProgressApp.controller('UsersController', function($scope, DataSendService, UserDataService, MapDataService) {

    UserDataService.init().then(function(data) {
        data.courses = [{"id": 1}, {"id": 2}, {"id": 3}]

        $scope.courses = data["courses"]
        $scope.users = data["users"]
    })

    $scope.courses = [{"id": 1}, {"id": 2}, {"id": 3}]

    $scope.addStudentToCourse = function(course_id, user_id) {

        var userData = {
            course_id : course_id,
            user_id : user_id
        }

        DataSendService.addData('/users', userData).then(function(data) {
            var newStudent = {
                id: data.id
            }

            MapDataService.initMap(course_id, user_id).then(function(data) {
                $scope.participants = data["participants"]
            })
            $scope.participants.push(newStudent);
        })

    }


})