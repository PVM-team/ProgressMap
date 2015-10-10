describe('EditCourseController', function () {

    var controller, scope;
    var httpServiceMock;
    var CanvasServiceMock;
    var fakeParticipant;
    var location;

    var assignments;

    beforeEach(function () {
        module('ProgressApp');

        httpServiceMock = (function () {
            var data = {};

            data.course = [{"id": 1, "name": 'ohtu'}];
            data.assignments =
                [{"id": 1, "number": 1, "location": {"id": 1, "x": 110, "y": 140}, "doers": [{"id": 2}, {"id": 1}]},
            {"id": 2, "number": 2, "location": {"id": 2, "x": 330, "y": 210}, "doers": [{"id": 1}]},
            {"id": 3, "number": 3, "location": {"id": 3, "x": 700, "y": 130}, "doers": [{"id": 1}]}];
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
                            if (path.match('/assignments')) {
                                return callback({assignment: [data]})
                            } else {
                                var arr = [];
                                for (var i = 0; i < scope.assignments.length; i++) {
                                    arr[i] = scope.assignments[i];
                                }
                                return callback({assignment: arr});
                            }
                        }
                    };
                }, putData: function (path, params) {
                    return {
                        then: function (callback) {
                            return callback({course: {name: scope.name}});
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

        CanvasServiceMock = (function () {
            return {
                initiateCanvas: function (assignmentCount, width, div, bgColor) {
                },
                drawSmoothPaths: function (assignmentCount) {
                },
                locationOfNewAssignment: function(i, previousLocation) {
                    var xStart;
                    var border = 50 + 2 * 25;
                    var relativeStartingPosition = (i % 4) * (2 * 25 + 200);

                    //toimii vaan 2 tasolla
                    if (i < 4) {
                        xStart =  border + relativeStartingPosition;
                    }
                    else {
                        xStart = border - relativeStartingPosition + (4 - 1) * (2 * 25 + 200);
                    }

                    var level = Math.ceil((i + 1) / 4) - 1;
                    var yStart = 50 + 2 * 25 + level * (2 * 25 + 200);


                    var x = Math.floor((Math.random() * 200) + xStart);
                    var y = Math.floor((Math.random() * 200) + yStart);

                    var location = {'x': x, 'y': y};

                    return location;
                },
                lastLevelFull: function(assignmentCount) {
                    return assignmentCount % 4 == 0;
                },
                levelHeight: function() {
                    return 250;
                }
            }
        })();


        inject(function ($controller, $rootScope, $routeParams, httpService, CanvasService, $location) {
            scope = $rootScope.$new();
            location = $location;
            spyOn(location, 'path');
            controller = $controller('EditCourseController', {
                $scope: scope,
                $routeParams: $routeParams,
                httpService: httpServiceMock,
                CanvasService: CanvasServiceMock
            });

        });


        fakeParticipant = {id: 7, firstName: "Pekan", lastName: "Dantilus"};

        scope.assignments = [{"id": 1, "number": 1, "location": {"id": 1, "x": 110, "y": 140}, "doers": [{"id": 2}, {"id": 1}]},
                       {"id": 2, "number": 2, "location": {"id": 2, "x": 330, "y": 210}, "doers": [{"id": 1}]},
                       {"id": 3, "number": 3, "location": {"id": 3, "x": 700, "y": 130}, "doers": [{"id": 1}]} ];
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

        it('should remove assignment from course', function () {
            var amount = scope.assignments.length;
            scope.deleteAssignment(scope.assignments[0]);

            expect(scope.assignments[0]).toEqual({"id": 2, "number": 2, "location": {"id": 2, "x": 330, "y": 210}, "doers": [{"id": 1}]})
            expect(scope.assignments.length).toBe(amount - 1);
            scope.deleteAssignment(scope.assignments[0]);
            expect(scope.assignments.length).toBe(amount - 2);
            expect(scope.assignments[0]).toEqual({"id": 3, "number": 3, "location": {"id": 3, "x": 700, "y": 130}, "doers": [{"id": 1}]})
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

        it('should increase assignment count if new assignment is added to course', function () {
            var amount = scope.assignments.length;
            scope.addAssignment();
            expect(scope.assignments.length).toBe(amount + 1);
        })

        it('should add assignment to correct location if level does not change', function () {
            var lastAssignment = scope.assignments[scope.assignments.length - 1];
            scope.addAssignment();
            var newAssignment = scope.assignments[scope.assignments.length - 1];
            expect(lastAssignment.location.x).toBeLessThan(newAssignment.location.x);
            expect(newAssignment.location.x - lastAssignment.location.x).toBeGreaterThan(50);
        })

        it ('should add assignment to correct location if new level is added', function () {
            scope.addAssignment();
            expect(scope.assignments.length).toBe(4);
            scope.addAssignment();
            expect(scope.assignments.length).toBe(5);
            scope.addAssignment();
            expect(scope.assignments.length).toBe(6);
            var assignment1 = scope.assignments[0];
            var assignment2 = scope.assignments[1];
            var assignment3 = scope.assignments[2];
            var assignment4 = scope.assignments[3];
            var assignment5 = scope.assignments[4];
            var assignment6 = scope.assignments[5];

            expect(assignment4.location.y).toBeLessThan(assignment5.location.y);
            expect(assignment6.location.x).toBeLessThan(assignment5.location.x);
            expect(assignment4.location.y).toBeLessThan(assignment6.location.y);
        })
    })
    describe ('editCourseName', function(){
        it('should change the name of the course currently in scope.course', function(){
            expect(scope.course.name).not.toBe("asdf");
            scope.name = "asdf";
            scope.editCourseName();
            expect(scope.course.name).toBe("asdf");
        })
    })

    describe('goToCoursePage', function(){
        it('should call location.path with right attributes', function(){
        scope.goToCoursePage();
        expect(location.path).toHaveBeenCalledWith('/map/1');
        })
    })
})
