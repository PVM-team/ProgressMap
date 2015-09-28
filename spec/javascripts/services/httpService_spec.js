describe('httpService', function () {
    var scope;
    var course_id = '25';
    var user_id = '8';
    var path = '/map/init.json';
    var data = 'data';
    var params = path + '?course_id='+course_id+'&user_id='+user_id; 
    var httpService;
    var $http;

    beforeEach(function() {
        module('ProgressApp');

        inject(function($rootScope, $httpBackend, _httpService_, $q) {
            scope = $rootScope.$new();
            httpService = _httpService_
            $http = $httpBackend;
            $http.when('POST', 'path', data).respond(200);
            $http.when('GET', params).respond(200);
            $http.when('PUT', 'path', 'data').respond(200);
            $http.when('DELETE', 'path').respond(200); 
        });
    });


    it('should call http.get when getData is called', function() {
        var result;
        result = httpService.getData(path, {params: {course_id: course_id, user_id: user_id}});
        $http.expectGET(params);
        $http.flush();
    });

    it('should call http.post when postData is called', function() {
        path = 'path';
        var result;
        result = httpService.postData(path, data);
        $http.expectPOST(path, data);
        $http.flush();
    });

    
    it('should call http.put when putData is called', function() {
        var result;
        result = httpService.putData('path', 'data');
        $http.expectPUT('path', 'data');
        $http.flush();
    });

    it('should call http.delete when deleteData is called', function() {
        var result;
        result = httpService.deleteData('path');
        $http.expectDELETE('path');
        $http.flush();
    });
});
