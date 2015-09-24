describe('DataSendService', function () {
    var scope;
    var path = 'path';
    var data = 'data';
    var dataService;
    var $http;

    beforeEach(function() {
        module('ProgressApp');

        inject(function($rootScope, $httpBackend, _DataSendService_, $q) {
            scope = $rootScope.$new();
            dataService = _DataSendService_; 
            $http = $httpBackend;
            $http.when('POST', path, data).respond(200);
        });
    });


    it('sends data to http', function() {
        var result;
        result = dataService.addData(path, data);
        $http.expectPOST(path, data);
        $http.flush();
    });
});


