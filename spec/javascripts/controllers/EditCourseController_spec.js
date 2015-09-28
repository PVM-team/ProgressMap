describe('EditCourseController', function () {

    var controller, scope;
    var httpServiceMock;
    var fakeParticipant;

    beforeEach(function () {
        module('ProgressApp');

        httpServiceMock = (function () {
            var data = {};

            data.course = [{"id": 1}];
            data.assignments =
                [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}]},
                    {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id": 1}]},
                    {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}]}];
            data.participants = [{"id": 1}, {"id": 2}, {"id": 3}];
            data.all_users = [{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}, {"id": 5}, {"id": 6}];

            return {
                getData: function (path, params) {
                    return {
                        then: function (callback) {
                            return callback(data);
                        }
                    };
                }, postData: function (path, data) {
                    return {
                        then: function (callback) {
                            return callback({assignment: [{id: 7}]});
                        }
                    };
                }, putData: function (path, params) {
                    return {
                        then: function (callback) {
                            return callback({});
                        }
                    };
                }, deleteData: function (path, params) {
                    return {
                        then: function (callback) {
                            return callback({});
                        }
                    };
                }
            }
        })();


        inject(function ($controller, $rootScope, $routeParams, httpService) {
            scope = $rootScope.$new();
            controller = $controller('EditCourseController', {
                $scope: scope,
                $routeParams: $routeParams,
                httpService: httpServiceMock
            });

        });


        fakeParticipant = {id: 7, firstName: "Pekan", lastName: "Dantilus"};
    })

    describe('initializing EditCourseController', function () {
        it('should set scope variables', function () {
            expect(scope.course.id).toBe(1);
            expect(scope.assignments.length).toBe(3);
            expect(scope.participants.length).toBe(3);
            expect(scope.allUsers.length).toBe(3);
        })
    })

    describe('deleteAssignment', function () {

        it('should remove assignment from course if it contains the assignment', function () {
            var amount = scope.assignments.length;
            scope.deleteAssignment(scope.assignments[0]);
            expect(scope.assignments.length).toBe(amount - 1);
        });
    })

    describe('deleteParticipant', function () {

        it('should remove participant from course if it contains the participant', function () {
            var pcount = scope.participants.length;
            var ucount = scope.allUsers.length;
            scope.deleteParticipant(1);
            expect(scope.participants.length).toBe(pcount - 1);
            expect(scope.allUsers.length).toBe(ucount + 1);
        })
    })

    describe('addParticipant', function () {

        it('should add participant to the course', function () {
            var pcount = scope.participants.length;
            expect(pcount).toBe(3);
            var ucount = scope.allUsers.length;
            expect(ucount).toBe(3);
            scope.addParticipant(fakeParticipant);
            expect(scope.participants.indexOf(fakeParticipant)).not.toBe(-1);
            expect(scope.participants.length).toBe(pcount + 1);
            expect(scope.allUsers.length).toBe(ucount - 1);
        })
    })

    describe('addAssignment', function () {

        it('should add assignment to the course', function () {
            var amount = scope.assignments.length;
            scope.addAssignment();
            expect(scope.assignments.length).toBe(amount + 1);
        })
    })
})