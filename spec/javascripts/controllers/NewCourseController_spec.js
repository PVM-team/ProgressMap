describe('NewCourseController', function () {
    var controller, scope;
    var httpServiceMock;
    var fakeParticipant;
    var CanvasServiceMock;

    beforeEach(function () {
        module('ProgressApp');
        
        fakeParticipant = {id: 5, firstName: "Pekan", lastName: "Dantilus"};

        httpServiceMock = (function () {
            return {
                postData: function(path, data) {
                    return{
                        then: function(callback) {
                            return callback({});
                        }
                    };
                }, getData: function(path, params) {
                    return{
                        then: function(callback) {
                            return callback({users: [{id: 1}, fakeParticipant]});
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
            scope = $rootScope.$new();
            controller = $controller('NewCourseController', {
                $scope: scope,
                httpService: httpServiceMock,
                CanvasService: CanvasServiceMock
            });

        });

        scope.name = "Test";
        scope.participants = [];
        scope.assignments = [];

        scope.addParticipant(fakeParticipant);
    })

    describe('initializing newCourseController', function() {
        it ('should set scope.allUsers to what httpService.addData returns minus users in scope.participants', function(){
            expect(scope.allUsers.length).toBe(1);
            expect(scope.allUsers.indexOf(fakeParticipant)).toBe(-1)
        })
    })

    describe ('calling scope.addParticipant', function(){
        it('should add given participant to scope.participants', function(){
            var fakeParticipantTheSecond = {id: 7, firstName: "Joku", lastName: "Pelle"};
            scope.addParticipant(fakeParticipantTheSecond)
            expect(scope.participants.indexOf(fakeParticipantTheSecond)).not.toBe(-1);
        })
    })

    describe('calling scope.removeUser', function(){
        it ('should remove given participant from scope.participants', function(){
            expect(scope.participants.length).toBe(1);
            scope.removeParticipant(fakeParticipant);
            expect(scope.participants.length).toBe(0);
        })
    })

    describe ('calling createCourse', function(){
        it ('should call on httpServiceMock.postData with parameters found in scope', function(){
            scope.createCourse();
            expect(httpServiceMock.postData).toHaveBeenCalledWith('/courses', {name: 'Test', assignments: [], participants: [fakeParticipant]});
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