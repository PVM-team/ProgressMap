describe('NewCourseController', function () {
    var controller, scope;
    var httpServiceMock;
    var fakeParticipant

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
                }, getData: function(path, params) {
                    return{
                        then: function(callback) {
                            return callback({users: [{id: 5}]});
                        }
                    };
                }
            }
        })();

        spyOn(httpServiceMock, 'postData').and.callThrough();

        inject(function ($controller, $rootScope, httpService) {
            scope = $rootScope.$new();
            controller = $controller('NewCourseController', {
                $scope: scope,
                httpService: httpServiceMock
            });

        });

        scope.name = "Test";
        scope.assignmentCount = 5;
        scope.participants = [];

        fakeParticipant = {id: 5, firstName: "Pekan", lastName: "Dantilus"};
        scope.addParticipant(fakeParticipant)

    })

    describe('initializing newCourseController', function(){
        it ('should set scope.allUsers to what httpService.addData returns', function(){
            expect(scope.allUsers[0].id).toBe(5);
        })
    })

    describe ('calling scope.addParticipant', function(){
        it('should add given participant to scope.participants', function(){
            var fakeParticipantTheSecond = {id: 5, firstName: "Joku", lastName: "Pelle"};
            scope.addParticipant(fakeParticipantTheSecond)
            expect(scope.participants.indexOf(fakeParticipantTheSecond)).not.toBe(-1);
        })
        describe('on a user who already is a participant', function(){
            it('should not change scope.participants', function(){
                expect(scope.participants.length).toBe(1);
                scope.addParticipant(fakeParticipant);
                expect(scope.participants.length).toBe(1);
            })
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
            expect(httpServiceMock.postData).toHaveBeenCalledWith('/courses', {name: 'Test', assignment_count: 5, participants: [fakeParticipant]});
        })

    })

})