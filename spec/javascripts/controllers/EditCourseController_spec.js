describe('EditCourseController', function () {

    var controller, scope;
    var httpServiceMock;

    beforeEach(function () {
        module('ProgressApp');
        var data = {};
        /*       en saanut mockia toimi, jotenkin sen pitäisi kaikki 3 funktiota sisältää
        httpServiceMock = (function () {
            var data = {};

            data.course = {"id": 1};
            data.assignments =
                [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}]},
                    {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 1}]},
                    {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}]}];
            data.participants = [{"id": 1}, {"id": 2}, {"id": 3}];
            data.allUsers = [{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}, {"id": 5}, {"id": 6}];

            return {
                getData: function(path, params){
                    return{
                        then: function(callback){
                            return callback(data);
                        }
                    };
                }, addData: function(path, data){
                    return{
                        then: function(callback){
                            return callback({});
                        }
                    };
                }
            }
        })();
         */
          data.course = {"id": 1};
         data.assignments =
            [{"id": 3, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}]},
            {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 1}]},
            {"id": 4, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}]}];
    data.participants = [{"id": 1}, {"id": 2}, {"id": 3}];
    data.allUsers = [{"id": 4}, {"id": 5}, {"id": 6}];

        inject(function ($controller, $rootScope, $routeParams) {
            scope = $rootScope.$new();
            controller = $controller('EditCourseController', {
                $scope: scope,
                $routeParams: $routeParams,
            });

        });

        scope.course = data["course"][0]
        scope.assignments = data["assignments"]
        scope.participants = data["participants"]
        scope.allUsers = data["allUsers"]
    })

    describe('deleteAssignment', function (){

        it('should remove assignment from course if it contains the assignment', function () {
            var amount = scope.assignments.length;
            scope.deleteAssignment(2);
            expect(scope.assignments.length).toBe(amount - 1);
        });

        it('should do nothing if assignments does not contain the assignment', function () {
            var amount = scope.assignments.length;
            scope.deleteAssignment(1);
            expect(scope.assignments.length).toBe(amount);
        })
    })

    describe('deleteParticipant', function () {

/*        it('should remove participant from course if it contains the participant', function () {
            var pcount = scope.participants.length;
            var ucount = scope.allUsers.length;
            scope.deleteParticipant(1);
            expect(scope.participants.length).toBe(pcount - 1);
            expect(scope.allUsers.length).toBe(ucount + 1);
        })
*/    })

    describe('addParticipant' , function () {

/*        it('should add participant to the course', function () {
            var pcount = scope.participants.length;
            var ucount = scope.allUsers.length;
            var p = {"id": 5};
            scope.addParticipant(p);
            expect(scope.participants.length).toBe(pcount + 1);
            expect(scope.allUsers.length).toBe(ucount - 1);
        })
 */   })

    describe('addAssignment', function () {

/*        it('should add assignment to the course', function () {
            var amount = scope.assignments.length;
            scope.addAssignment();
            expect(scope.assignments.length).toBe(amount + 1);
        })
*/    })
})