describe('UserDataService', function() {
    var scope;
    var $http;
    var UserDataService;
    var path = '/users/init.json';

    beforeEach(function() {
        module('ProgressApp');


        inject(function($rootScope, $httpBackend, _UserDataService_) {
            scope = $rootScope.$new(); 
            $http = $httpBackend;
            UserDataService = _UserDataService_;
            $http.when('GET', path).respond(200);
        });
    });

    it('should call http.get when UserDataService.init is called', function() {
        var result = UserDataService.init();
        $http.expectGET(path);     
        $http.flush();
    });

});

