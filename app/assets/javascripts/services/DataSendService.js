ProgressApp.service('DataSendService', function ($http, $q){

    var deferred = $q.defer();

    this.addStudent = function(course){
        return $http.post('/users', course)
            .then(function(response) {
            return response.data;
        }, function (response){
                deferred.reject(response);
                return deferred.promise
            })
    }

})