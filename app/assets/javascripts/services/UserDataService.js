ProgressApp.service('UserDataService', function ($http, $q) {

    var deferred = $q.defer()

    this.init = function() {

        return $http.get('/users/init.json', {})

            .then(function (response) {
                return response.data

            })/*, function (response) {
                deferred.reject(response)
                return deferred.promise
            })*/
    }
})
