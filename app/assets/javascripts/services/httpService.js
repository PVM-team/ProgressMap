ProgressApp.service('httpService', function ($http, $q) {

    //var deferred = $q.defer();

    this.getData = function(path, params){
        return $http.get(path, params)

            .then(function (response) {
                return response.data;

                //deferred.resolve(response.data)
                //return deferred.promise

            })/*, function (response) {
         deferred.reject(response)
         return deferred.promise
         })*/
    }

    this.postData = function(path, data){
        return $http.post(path, data)
            .then(function(response) {
                return response.data;
            })/*, function (response){
         deferred.reject(response);
         return deferred.promise
         })*/
    }

    this.putData = function(path, data) {
        return $http.put(path, data)
            .then(function(response) {
                return response.data;
            })
    }

    this.deleteData = function(path) {
        return $http.delete(path)
            .then(function(response) {
                return response.data;
            })
    }    

})
