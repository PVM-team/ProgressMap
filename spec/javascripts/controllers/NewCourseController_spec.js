describe('NewCourseController', function () {
    var controller, scope;
    var DataSendServiceMock;

    beforeEach(function () {
        module('ProgressApp');

        DataSendServiceMock = (function () {
            return {
                addData: function(path, data){
                    return{
                        then: function(callback){
                            return callback({id: 5});
                        }
                    };
                }
            }
        })();

        spyOn(DataSendServiceMock, 'addData').and.callThrough();

        inject(function ($controller, $rootScope, DataSendService) {
            scope = $rootScope.$new();
            controller = $controller('NewCourseController', {
                $scope: scope,
                DataSendService: DataSendServiceMock
            });

        });

        scope.name = "Test";
        scope.assignmentCount = 5;
    })

    describe ('calling createCourse', function(){
        it ('should call on DataSendService.addData', function(){
            scope.createCourse();
            expect(DataSendServiceMock.addData).toHaveBeenCalled();
        })

    })

})