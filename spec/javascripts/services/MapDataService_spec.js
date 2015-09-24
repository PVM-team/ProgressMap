describe('MapDataService', function () {
    var scope;
    var course_id = '25';
    var user_id = '8';
    var path = '/map/init.json';
    var params = path + '?course_id='+course_id+'&user_id='+user_id; 
    var MapDataService;
    var $http;

    beforeEach(function() {
        module('ProgressApp');

        inject(function($rootScope, $httpBackend, _MapDataService_, $q) {
            scope = $rootScope.$new();
            MapDataService = _MapDataService_
            $http = $httpBackend;
            $http.when('GET', params).respond(200);
        });
    });


    it('should call http.get when initMap is called', function() {
        var result;
        result = MapDataService.initMap(course_id, user_id);
        $http.expectGET(params);
        $http.flush();
    });
});
