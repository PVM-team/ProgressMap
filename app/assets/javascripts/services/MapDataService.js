ProgressApp.service('MapDataService', function ($http, $q) {

    var deferred = $q.defer()

    this.initMap = function() {

        return $http.get('/map/init.json', {params: {course_id: 1, user_id: 2}})

            .then(function (response) {
                deferred.resolve(response.data)
                return deferred.promise
            }, function (response) {
              deferred.reject(response)
                return deferred.promise
            })
    }
})