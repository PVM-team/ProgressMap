describe('MapController', function () {

    var controller, scope;
    var CanvasServiceMock;
    var httpServiceMock;
    var StateServiceMock;
    var undoneAssignment;
    var doneAssignment;
    var location;
    beforeEach(function () {
        module('ProgressApp');

        //leikkii backendiä, palauttaa testejä varten esimerkkidatan
        httpServiceMock = (function () {
            var data = {};

            data.course = [{"id": 1}];
            data.assignments =
                [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}], "students_tasks": [{"student_id": 1, "timestamp": 2014}, {"student_id": 2, "timestamp": 2015}], "number": 1},
                    {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 1}], "students_tasks": [{"student_id": 1, "timestamp": 2013}], "number": 2},
                    {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}], "students_tasks": [{"student_id": 1, "timestamp": 2015}], "number": 3}];
            data.students = [{"id": 1}, {"id": 2}, {"id": 3}];
            data.current_student = [{"id": 2}];

            return {
                getData: function(path, params){
                    return{
                        then: function(callback){
                            return callback(data);
                        }
                    };
                },
                postData: function(path, data) {
                    return{
                        then: function(callback){
                            return callback({id: (scope.students.length + 1)});
                        }
                    };
                }

            }
        })();

        //ei tee mitään
        CanvasServiceMock = (function () {
            return {
                initiateCanvas: function (assignmentCount, width, div, bgColor) {
                },
                drawSmoothPaths: function (assignmentCount) {
                }
            }
        })();

        StateServiceMock = (function () {
            var student;
            return {
                setCurrentStudent: function (currentStudent) {
                    student = currentStudent;
                },
                getCurrentStudent: function() {
                    return student;
                }
            }
        })();



        spyOn(StateServiceMock, 'setCurrentStudent').and.callThrough();
        spyOn(CanvasServiceMock, 'initiateCanvas').and.callThrough();
        spyOn(httpServiceMock, 'getData').and.callThrough();
        spyOn(httpServiceMock, 'postData').and.callThrough();
        spyOn(CanvasServiceMock, 'drawSmoothPaths').and.callThrough();


        inject(function ($controller, $rootScope, $routeParams, httpService, CanvasService, StateService, $location) {
            scope = $rootScope.$new();
            location = $location;
            spyOn(location, 'path');
            controller = $controller('MapController', {
                $scope: scope,
                $routeParams: $routeParams,
                httpService: httpServiceMock,
                CanvasService: CanvasServiceMock,
                StateService: StateServiceMock
            });

        });

        undoneAssignment = scope.assignments[1];
        doneAssignment = scope.assignments[0];

    });

    describe ('when initializing MapController', function(){
        it('calls on CanvasService.initiateCanvas', function(){
            expect(CanvasServiceMock.initiateCanvas).toHaveBeenCalled();
        })
        it('calls on httpService.getData', function(){
            expect(httpServiceMock.getData).toHaveBeenCalled();
        })
        it('calls on CanvasService.drawSmoothPaths', function(){
            expect(CanvasServiceMock.drawSmoothPaths).toHaveBeenCalled();
        })
    })

    describe ('initializing MapController retrieves data from httpService', function(){
        it('sets scope.course to 1', function(){
            expect(scope.course.id).toBe(1);
        })
        it('sets scope.assignments to what httpService returns', function(){
            expect(scope.assignments.length).toBe(3);
            expect(scope.assignments[0].id).toBe(1);
            expect(scope.assignments[1].location.x).toBe(330);
            expect(scope.assignments[2].doers.length).toBe(1);
        })
        it('sets scope.students to what httpService returns', function(){
            expect(scope.students.length).toBe(3);
            expect(scope.students[0].id).toBe(1);
        })
        it('sets scope.currentStudent to what httpService returns', function(){
            expect(scope.currentStudent.id).toBe(2);
        })
        it('sets scope.doneAssignments to those of scope.currentStudent', function(){
            expect(scope.doneAssignments.length).toBe(1);
        })
    })


    describe('viewAsStudent', function() {

        it('changes currentStudent to the student which is given as parameter', function () {
            expect(scope.currentStudent.id).toBe(2)
            scope.viewAsStudent({"id": 3});

            expect(scope.currentStudent.id).toBe(3);
        });

        it('sets doneAssignments when student is valid', function () {
            expect(scope.doneAssignments.length).not.toBe(3);
            scope.viewAsStudent(scope.students[0]);

            expect(scope.doneAssignments.length).toBe(3);
        });
    })

    describe('assignmentCompleted returns', function() {

        it ('true if student has done the assignment', function () {
            scope.viewAsStudent({"id": 2})
            expect(scope.assignmentCompleted(scope.assignments[0])).toBe(true)
        })

        it ('false if student has not done the assignment', function () {
            scope.viewAsStudent({"id": 2})
            expect(scope.assignmentCompleted(scope.assignments[1])).toBe(false);
        })
    })

    describe('marking assignments', function(){
        
        describe('when undone', function(){
            it('calls on httpService.postData with assignment id, current student id and path students_tasks', function(){
                scope.markAssignmentAsDone(undoneAssignment);
                var data2 = {assignment_id: 2, student_id: scope.currentStudent.id}
                expect(httpServiceMock.postData).toHaveBeenCalledWith("students_tasks", data2);
            })
            it('sets them as done', function(){
                scope.markAssignmentAsDone(undoneAssignment);
                expect(scope.doneAssignments.indexOf(undoneAssignment)).not.toBe(-1);
            })
            it('increases the assignment doers', function(){
                expect(undoneAssignment.doers.length).toBe(1);
                scope.markAssignmentAsDone(undoneAssignment);
                expect(undoneAssignment.doers.length).toBe(2);
            })
        })

        describe('when done', function(){
            it('calls on httpService.postData with assignment id, current student id and path students_tasks/destroy', function(){
                scope.markAssignmentAsUndone(doneAssignment);
                var data2 = {assignment_id: 1, student_id: scope.currentStudent.id}
                expect(httpServiceMock.postData).toHaveBeenCalledWith("students_tasks/destroy", data2);
            })
            it ('sets them as undone', function(){
                scope.markAssignmentAsUndone(doneAssignment);
                expect(scope.doneAssignments.indexOf(doneAssignment)).toBe(-1);
            })
            it('decreases the assignment doers', function(){
                expect(doneAssignment.doers.length).toBe(2);
                scope.markAssignmentAsUndone(doneAssignment);
                expect(doneAssignment.doers.length).toBe(1);
            })
        })

    })

    describe('moveToCourseCreationView', function(){
        it ('should call StateService.setCurrentStudent with correct value', function(){
            scope.moveToCourseCreationView();
            expect(StateServiceMock.setCurrentStudent).toHaveBeenCalledWith(scope.currentStudent);
        })
    })

    describe('goToActionMap', function(){
        it('should call location.path when function is called', function(){
            scope.goToActionMap();
             expect(location.path).toHaveBeenCalledWith('/actionmap/1');
        })
    });
})
