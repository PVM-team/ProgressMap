describe('NewCourseController', function () {
    var controller, scope;
    var httpServiceMock;

    beforeEach(function () {
        module('ProgressApp');

        httpServiceMock = (function () {
            return {
                addData: function(path, data){
                    return{
                        then: function(callback){
                            return callback({id: 5});
                        }
                    };
                }, getData: function(path, params){
                    return{
                        then: function(callback){
                            return callback({});
                        }
                    };
                }
            }
        })();

        spyOn(httpServiceMock, 'addData').and.callThrough();

        inject(function ($controller, $rootScope, httpService) {
            scope = $rootScope.$new();
            controller = $controller('NewCourseController', {
                $scope: scope,
                httpService: httpServiceMock
            });

        });

        scope.name = "Test";
        scope.assignmentCount = 5;
    })

    describe ('calling createCourse', function(){
        it ('should call on httpServiceMock.addData with parameters found in scope', function(){
            scope.createCourse();
            expect(httpServiceMock.addData).toHaveBeenCalledWith('/courses', {name: 'Test', assignment_count: 5});
        })

    })

})