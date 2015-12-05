describe('NewCourseController', function () {
    var controller, scope, rootScope;
    var httpServiceMock;
    var CanvasServiceMock;

    beforeEach(function () {
        module('ProgressApp');

        httpServiceMock = (function () {
            return {
                postData: function(path, data) {
                    return{
                        then: function(callback) {
                            return callback({});
                        }
                    };
                }
            }
        })();

        CanvasServiceMock = (function () {
            return {      
                initiateCanvas: function (assignmentCount, width, div, bgColor) {
                },
                drawSmoothPaths: function (assignmentCount) {
                },
                drawLocationForAssignment: function(i, location) {
                    if (i >= 0 && i < 4) {
                        return {'x': 100 + i * 250 + 50, 'y': 100 + 250 + 30};
                    }
                    else if (i >= 4 && i < 8) {
                        return {'x': 100 - i * 250 + 3 * 250 + 50, 'y': 100 + 70};
                    }
                    return null;
                }
            }
        })();

        spyOn(httpServiceMock, 'postData').and.callThrough();

        inject(function ($controller, $rootScope, httpService, CanvasService) {
            rootScope = $rootScope;
            //rootScope.currentUser = {'name': 'Teppo', 'courses': [], 'email': 'matti_ja_teppo@hotmail.swe'};
            
            scope = $rootScope.$new();

            controller = $controller('NewCourseController', {
                $rootScope: rootScope,
                $scope: scope,
                httpService: httpServiceMock,
                CanvasService: CanvasServiceMock
            });
        });

        scope.name = "Test";
        scope.assignments = [];
        rootScope.currentUser = {'name': 'Teppo', 'courses': [], 'email': 'matti_ja_teppo@hotmail.swe'};
    })

    describe ('calling createCourse', function(){
        it ('should call on httpServiceMock.postData with parameters found in scope', function(){
            scope.createCourse();
            expect(httpServiceMock.postData).toHaveBeenCalledWith('/courses', { name: 'Test', assignments: [], teacherEmail: 'matti_ja_teppo@hotmail.swe' });
        })
    })

    describe ('calling scope.placeAssignmentButtonsOnCanvas', function() {

        it ("should set scope.assignments accordingly", function() {
            scope.assignmentCount = 8;
            scope.placeAssignmentButtonsOnCanvas();

            expect(scope.assignments.length).toBe(8);

            for (var i = 0; i < scope.assignments.length; i++) {

                var assignment = scope.assignments[i];
                expect(assignment.number).toBe(i + 1);

                var expectedLocation;

                if (i < 4) {
                    expectedLocation = {'x': 100 + i * 250 + 50, 'y': 100 + 250 + 30};
                }
                else {
                    expectedLocation = {'x': 100 - i * 250 + 3 * 250 + 50, 'y': 100 + 70};
                }

                expect(assignment.location).toEqual(expectedLocation);
                expect(assignment.dependencies).toEqual([]);
            }
        })

    })

})