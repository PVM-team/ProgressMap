describe('EditCourseController', function () {

    var controller, scope;
    var httpServiceMock;
    var CanvasServiceMock;
    var location;

    var assignments;

    beforeEach(function () {
        module('ProgressApp');

        httpServiceMock = (function () {
            var data = {};

            data.course = [{"id": 1, "name": 'ohtu'}];
            data.assignments = [{"id": 1, "number": 1, "location": {"id": 1, "x": 110, "y": 140}, "doers": [{"id": 2}, {"id": 1}], "dependencies": {}},
                                {"id": 2, "number": 2, "location": {"id": 2, "x": 330, "y": 210}, "doers": [{"id": 1}], "dependencies": {}},
                                {"id": 3, "number": 3, "location": {"id": 3, "x": 700, "y": 130}, "doers": [{"id": 1}], "dependencies": {id: 1}}];
            data.students = [{"id": 1}, {"id": 2}, {"id": 3}];

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
                                return callback({assignment: [data]});
                            } else {
                                return callback({assignment: scope.assignments});
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
                    var borderSize = 25;
                    var border = 50 + 2 * borderSize;
                    var blockSize = 200;
                    var assignmentsPerLevel = 4;
                    var relativeStartingPosition = (i % 4) * (2 * borderSize + blockSize);

                    var level = Math.ceil((i + 1) / 4) - 1;

                    if ((i % 8) >= 4) {
                        xStart =  100 - i * 250 + 3 * 250;
                    }
                    else {
                        xStart = 100 + i * 250;
                    }

                    var yStart = 50 + 2 * borderSize + level * (2 * borderSize + blockSize)

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
    })

    describe('changeDependenciesOfAssignment', function() {
        it('should remove old dependencies', function() {
            scope.changeDependenciesOfAssignment(scope.assignments[2]);
            expect(scope.assignments[2].dependencyText.length).toEqual(0);
        })
    })

    describe('initializing EditCourseController', function () {
        it('should set scope variables', function () {
            expect(scope.course.id).toBe(1);
            expect(scope.assignments.length).toBe(3);
            expect(scope.students.length).toBe(3);
        })
    })

    describe('deleteAssignment', function () {

        it('should remove assignment from course', function () {
            var amount = scope.assignments.length;
            scope.deleteAssignment(scope.assignments[0]);

            expect(scope.assignments[0]).toEqual({"id": 2, "number": 2, "location": {"id": 2, "x": 330, "y": 210}, "doers": [{"id": 1}], "dependencies": {} , dependencyText: ''});
            expect(scope.assignments.length).toBe(amount - 1);
            scope.deleteAssignment(scope.assignments[0]);
            expect(scope.assignments.length).toBe(amount - 2);
            expect(scope.assignments[0]).toEqual({"id": 3, "number": 3, "location": {"id": 3, "x": 700, "y": 130}, "doers": [{"id": 1}], "dependencies": { id: 1 }, dependencyText: ''});
        })

        it('should remove level if there is no assignments left on it after delete', function () {
            var amount = scope.assignments.length;
            scope.addAssignment();
            scope.addAssignment();
            expect(scope.assignments.length).toEqual(amount + 2);
            var assignment5 = scope.assignments[scope.assignments.length - 1];
            expect(assignment5.location.y).toBeGreaterThan(349); // assignment is on 2nd level
            scope.deleteAssignment(scope.assignments[scope.assignments.length - 1]);
            var lastAssignment = scope.assignments[scope.assignments.length - 1];
            expect(lastAssignment.location.y).toBeLessThan(301);
        })

        it('should be able to add new assignment if all assignments are deleted and the added assignment is in correct block', function () {
            scope.deleteAssignment(scope.assignments[1]);
            scope.deleteAssignment(scope.assignments[0]);
            scope.deleteAssignment(scope.assignments[0]);
            expect(scope.assignments.length).toEqual(0);
            scope.addAssignment();
            expect(scope.assignments.length).toEqual(1);
            expect(scope.assignments[0].location.x >= 100 && scope.assignments[0].location.x < 100 + 200).toBe(true);
            expect(scope.assignments[0].location.y >= 100 && scope.assignments[0].location.y < 100 + 200).toBe(true);
        })
    })

    describe('deleteStudent', function () {

        it('should remove the selected student from course', function () {
            var count = scope.students.length;
            var secondStudent = scope.students[1];

            scope.deleteStudent(scope.students[0]);

            expect(scope.students.length).toBe(count - 1);
            expect(scope.students[0]).toEqual(secondStudent);
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
