ProgressApp.service('MapDataService', function ($http, $q, StateService) {

    var deferred = $q.defer()

    this.initMap = function(course_id) {
        var user_id = 2

        user = StateService.getCurrentUser()
        if (user) { 
            user_id = user.id 
        }

        return $http.get('/map/init.json', { params: { course_id: course_id, user_id: user_id }})

            .then(function (response) {
                return response.data
                
                //deferred.resolve(response.data)
                //return deferred.promise
            
            }, function (response) {
              deferred.reject(response)
                return deferred.promise
            })
    }
})