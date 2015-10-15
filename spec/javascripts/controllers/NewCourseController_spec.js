describe('NewCourseController', function () {
    var controller, scope;
    var httpServiceMock;
    var fakeStudent;
    var CanvasServiceMock;

    beforeEach(function () {
        module('ProgressApp');
        
        fakeStudent = {id: 5, firstName: "Pekan", lastName: "Dantilus"};

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
                            return callback({students: [{id: 1}, fakeStudent]});
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
        scope.students = [];
        scope.assignments = [];

        scope.addStudent(fakeStudent);
    })

    describe('initializing newCourseController', function() {
        it ('should set scope.allStudents to what httpService.addData returns minus students in scope.students', function(){
            expect(scope.allStudents.length).toBe(1);
            expect(scope.allStudents.indexOf(fakeStudent)).toBe(-1)
        })
    })

    describe ('calling scope.addStudent', function(){
        it('should add given student to scope.students', function(){
            var fakeStudentTheSecond = {id: 7, firstName: "Joku", lastName: "Pelle"};
            scope.addStudent(fakeStudentTheSecond)
            expect(scope.students.indexOf(fakeStudentTheSecond)).not.toBe(-1);
        })
    })

    describe('calling scope.removeStudent', function(){
        it ('should remove given student from scope.students', function(){
            expect(scope.students.length).toBe(1);
            scope.removeStudent(fakeStudent);
            expect(scope.students.length).toBe(0);
        })
    })

    describe ('calling createCourse', function(){
        it ('should call on httpServiceMock.postData with parameters found in scope', function(){
            scope.createCourse();
            expect(httpServiceMock.postData).toHaveBeenCalledWith('/courses', {name: 'Test', assignments: [], students: [fakeStudent]});
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