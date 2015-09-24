ProgressApp.service('MapDataService', function ($http, $q) {

    var deferred = $q.defer()

    this.initMap = function(course_id, user_id) {

        return $http.get('/map/init.json', { params: { course_id: course_id, user_id: user_id }})

            .then(function (response) {
                return response.data

                //deferred.resolve(response.data)
                //return deferred.promise

            })/*, function (response) {
                deferred.reject(response)
                return deferred.promise
            })*/
    }
})
