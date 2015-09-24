ProgressApp.service('DataSendService', function ($http, $q){
    var deferred = $q.defer();

    this.addData = function(path, data){
        return $http.post(path, data)
            .then(function(response) {
                return response.data;
            })/*, function (response){
                deferred.reject(response);
                return deferred.promise
            })*/
    }

})
