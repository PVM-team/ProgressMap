describe('ActionMapController', function () {
    var controller, scope;
    var CanvasServiceMock;
    var httpServiceMock;
    var StateServiceMock;
    var location;
   
    beforeEach(function () {
        module('ProgressApp');

        httpServiceMock = (function () {
            var data1 = {};

            data1.course = [{"id": 1}];
            data1.assignments = [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "number": 1},
                                {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "number": 2},
                                {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "number": 3} ];
            
            data1.students = [{"id": 1,  "lastDoneAssignment": null},
                                 {"id": 2,  "lastDoneAssignment": {"number": 1, "timestamp": 1}}, 
                                 {"id": 3,  "lastDoneAssignment": {"number": 1, "timestamp": 2}},
                                 {"id": 4,  "lastDoneAssignment": {"number": 2, "timestamp": 3}},
                                 {"id": 6,  "lastDoneAssignment": {"number": 2, "timestamp": 4}},
                                 {"id": 7,  "lastDoneAssignment": {"number": 2, "timestamp": 5}},
                                 {"id": 5,  "lastDoneAssignment": {"number": 2, "timestamp": 6}},
                                 {"id": 8,  "lastDoneAssignment": {"number": 1, "timestamp": 7}},
                                 {"id": 9,  "lastDoneAssignment": {"number": 3, "timestamp": 8}},
                                 {"id": 10, "lastDoneAssignment": {"number": 2, "timestamp": 9}},
                                 {"id": 11, "lastDoneAssignment": {"number": 2, "timestamp": 10}},
                                 {"id": 12, "lastDoneAssignment": {"number": 3, "timestamp": 11}} ];

            data1.current_student = [{"id": 2}];

            data3 = {};
            data3.students = [{"id": 1,  "lastDoneAssignment": {"number": 1, "timestamp": 12}},
                                  {"id": 2,  "lastDoneAssignment": {"number": 1, "timestamp": 1}},
                                  {"id": 3,  "lastDoneAssignment": {"number": 1, "timestamp": 2}},
                                  {"id": 4,  "lastDoneAssignment": {"number": 2, "timestamp": 3}},
                                  {"id": 6,  "lastDoneAssignment": {"number": 2, "timestamp": 4}},
                                  {"id": 7,  "lastDoneAssignment": {"number": 2, "timestamp": 5}},
                                  {"id": 5,  "lastDoneAssignment": {"number": 2, "timestamp": 6}},
                                  {"id": 8,  "lastDoneAssignment": {"number": 1, "timestamp": 7}},
                                  {"id": 9,  "lastDoneAssignment": {"number": 3, "timestamp": 8}},
                                  {"id": 10, "lastDoneAssignment": {"number": 2, "timestamp": 9}},
                                  {"id": 11, "lastDoneAssignment": {"number": 2, "timestamp": 10}},
                                  {"id": 12, "lastDoneAssignment": {"number": 3, "timestamp": 11}} ];

            data4 = {};
            data4.students = [{"id": 1,  "lastDoneAssignment": {"number": 1, "timestamp": 12}},
                                  {"id": 2,  "lastDoneAssignment": {"number": 1, "timestamp": 1}},
                                  {"id": 3,  "lastDoneAssignment": {"number": 1, "timestamp": 2}},
                                  {"id": 4,  "lastDoneAssignment": {"number": 2, "timestamp": 3}},
                                  {"id": 6,  "lastDoneAssignment": {"number": 2, "timestamp": 4}},
                                  {"id": 7,  "lastDoneAssignment": {"number": 1, "timestamp": 13}},
                                  {"id": 5,  "lastDoneAssignment": {"number": 2, "timestamp": 6}},
                                  {"id": 8,  "lastDoneAssignment": {"number": 1, "timestamp": 7}},
                                  {"id": 9,  "lastDoneAssignment": {"number": 2, "timestamp": 15}},
                                  {"id": 10, "lastDoneAssignment": {"number": 2, "timestamp": 9}},
                                  {"id": 11, "lastDoneAssignment": {"number": 2, "timestamp": 10}},
                                  {"id": 12, "lastDoneAssignment": {"number": 1, "timestamp": 14}} ];

            var i = 0;

            return {
                getData: function(path, params) {
                    i++;

                    if (i == 1) {
                        return {
                            then: function(callback) {
                                return callback(data1);
                            }
                        };
                    }
                    else if (i == 2) {
                        return {
                            then: function(callback) {
                                return callback(data1);
                            }
                        };
                    }
                    else if (i == 3) {
                        return {
                            then: function(callback) {
                                return callback(data3);
                            }
                        };
                    }
                    else if (i == 4) {
                        return {
                            then: function(callback) {
                                return callback(data4);
                            }
                        };
                    }
                },
                postData: function(path, data) {
                    return{
                        then: function(callback) {
                            return callback({id: (scope.students.length + 1)});
                        }
                    };
                }

            }
        })();

        //ei tee mitään
        CanvasServiceMock = (function () {
            return {
                initiateCanvas: function (id, height, width, div) {
                },
                drawSmoothPaths: function (locations) {
                },
                initiatePaperCanvas: function (id, height, width) {
                }
            }
        })();

        StateServiceMock = (function () {
            var currentStudent = {"id": 1, "token": "abc123"};

            return {
                getCurrentStudent: function() {
                    return currentStudent;
                }
            }
        })();

        spyOn(CanvasServiceMock, 'initiateCanvas').and.callThrough();
        spyOn(httpServiceMock, 'getData').and.callThrough();
        spyOn(httpServiceMock, 'postData').and.callThrough();
        spyOn(CanvasServiceMock, 'drawSmoothPaths').and.callThrough();


        inject(function ($controller, $rootScope, $routeParams, httpService, CanvasService, StateService, $location) {
            scope = $rootScope.$new();
            location = $location;
            spyOn(location, 'path');
            controller = $controller('ActionMapController', {
                $scope: scope,
                $routeParams: $routeParams,
                httpService: httpServiceMock,
                CanvasService: CanvasServiceMock,
                StateService: StateServiceMock
            });
        });
    });

    describe('goToNormalMap', function(){
        it('should go to the map of the current student when function is called', function() {
            scope.goToNormalMap();
            expect(location.path).toHaveBeenCalledWith('/student/abc123');
        })
    })

    describe ('initializing ActionMapController initializes scope with correct data from httpService', function(){

        it('scope.course is set to 1', function(){
            expect(scope.course.id).toBe(1);
        })

        it('scope.assignments is what it is supposed to be initially', function() {
            stateInitially(scope);
        })

        it("scope.students is set to data['students']", function() {
            expect(scope.students.length).toBe(12);
            expect(scope.students[0].id).toBe(1);

            expect(scope.students[4].id).toBe(6);
            expect(scope.students[4].lastDoneAssignment.number).toBe(2);
            expect(scope.students[4].lastDoneAssignment.timestamp).toBe(4);
        })
    })

    /* describe('after interval occurs and data for students is received again', function() {

        describe('and no new data is provided', function() {

            it ('nothing will change', function() {
                doInterval(1, controller);
                stateInitially(scope);
            })
        })

        describe('and after a second interval and student ID = 1 does assignment 1', function() {

            it ('student 1 is added to latestDoers of assignment 1', function() {
                doInterval(2, controller);

                expect(scope.assignments[0].latestDoers.length).toBe(4)
                expect(scope.assignments[0].latestDoers[0].id).toBe(1)
                expect(scope.assignments[0].latestDoers[1].id).toBe(8)
                expect(scope.assignments[0].latestDoers[2].id).toBe(3)
                expect(scope.assignments[0].latestDoers[3].id).toBe(2)

                expect(scope.assignments[2].latestDoers.length).toBe(2)
            })

        })

        describe('and after a third interval student ID = 9 who had previously done assignment 3 does assignment 2, student ID = 7 who had previously done assignment 2 and was in latestDoers of that assignment does assignment 1, and student ID = 12 who had previously done assignment 3, and was in latestDoers of that assignment does assignment 1', function() {

            it ('student 12 is removed from latestDoers of assignment 3', function() {
                doInterval(3, controller);
                expect(scope.assignments[2].latestDoers.length).toBe(0)
            })

            it ('student 7 is removed from latestDoers of assignment 2, and after the funtion, it contains the 5 latest doers', function() {
                doInterval(3, controller);

                expect(scope.assignments[1].latestDoers.length).toBe(5)
                expect(scope.assignments[1].latestDoers[0].id).toBe(9)
                expect(scope.assignments[1].latestDoers[1].id).toBe(11)
                expect(scope.assignments[1].latestDoers[2].id).toBe(10)
                expect(scope.assignments[1].latestDoers[3].id).toBe(5)
                expect(scope.assignments[1].latestDoers[4].id).toBe(6)
            })

            it ('after the functuion, assignment 1 contains the 5 latest doers', function() {
                doInterval(3, controller);

                expect(scope.assignments[0].latestDoers.length).toBe(5)
                expect(scope.assignments[0].latestDoers[0].id).toBe(12)
                expect(scope.assignments[0].latestDoers[1].id).toBe(7)
                expect(scope.assignments[0].latestDoers[2].id).toBe(1)
                expect(scope.assignments[0].latestDoers[3].id).toBe(8)
                expect(scope.assignments[0].latestDoers[4].id).toBe(3)
            })         

        })  

    }) */
})

/* function doInterval(times, controller) {
    for (var i = 0; i < times; i++) {
        controller.updateLatestAssignments();
    }
} */

function stateInitially(scope) {
    expect(scope.assignments[0].id).toBe(1);
    expect(scope.assignments[0].latestDoers.length).toBe(3)

    expect(scope.assignments[0].latestDoers[0].id).toBe(8)
    expect(scope.assignments[0].latestDoers[1].id).toBe(3)
    expect(scope.assignments[0].latestDoers[2].id).toBe(2)

    expect(scope.assignments[1].id).toBe(2);
    expect(scope.assignments[1].latestDoers.length).toBe(5)

    expect(scope.assignments[1].latestDoers[0].id).toBe(11)
    expect(scope.assignments[1].latestDoers[1].id).toBe(10)
    expect(scope.assignments[1].latestDoers[2].id).toBe(5)
    expect(scope.assignments[1].latestDoers[3].id).toBe(7)
    expect(scope.assignments[1].latestDoers[4].id).toBe(6)

    expect(scope.assignments[2].id).toBe(3);
    expect(scope.assignments[2].latestDoers.length).toBe(2)

    expect(scope.assignments[2].latestDoers[0].id).toBe(12)
    expect(scope.assignments[2].latestDoers[1].id).toBe(9)
}