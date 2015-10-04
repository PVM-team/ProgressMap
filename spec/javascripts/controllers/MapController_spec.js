describe('MapController', function () {

    var controller, scope;
    var CanvasServiceMock;
    var httpServiceMock;
    var StateServiceMock;
    var undoneAssignment;
    var doneAssignment;

    beforeEach(function () {
        module('ProgressApp');

        //leikkii backendiä, palauttaa testejä varten esimerkkidatan
        httpServiceMock = (function () {
            var data = {};

            data.course = [{"id": 1}];
            data.assignments =
                [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}], "dependencies": [{"id":2}]},
                    {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 1}], "dependencies": [{"id":1}]},
                    {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}]}];
            data.participants = [{"id": 1}, {"id": 2}, {"id": 3}];
            data.current_user = [{"id": 2}];

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
                            return callback({id: (scope.participants.length + 1)});
                        }
                    };
                }

            }
        })();

        //ei tee mitään
        CanvasServiceMock = (function () {
            return {
                initiateCanvas: function (height, width, div, bgColor) {
                },
                drawSmoothPaths: function (locations) {
                }
            }
        })();

        StateServiceMock = (function () {
            var user;
            var course;
            return {
                setCurrentUser: function (currentUser) {
                    user = currentUser;
                },
                getCurrentUser: function(){
                    return user;
                },
                setCurrentCourse: function(currentCourse){
                    course = currentCourse;
                }
            }
        })();



        spyOn(StateServiceMock, 'setCurrentUser').and.callThrough();
        spyOn(StateServiceMock, 'setCurrentCourse').and.callThrough();
        spyOn(CanvasServiceMock, 'initiateCanvas').and.callThrough();
        spyOn(httpServiceMock, 'getData').and.callThrough();
        spyOn(httpServiceMock, 'postData').and.callThrough();
        spyOn(CanvasServiceMock, 'drawSmoothPaths').and.callThrough();


        inject(function ($controller, $rootScope, $routeParams, httpService, CanvasService, StateService) {
            scope = $rootScope.$new();
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
        it('sets scope.participants to what httpService returns', function(){
            expect(scope.participants.length).toBe(3);
            expect(scope.participants[0].id).toBe(1);
        })
        it('sets scope.currentUser to what httpService returns', function(){
            expect(scope.currentUser.id).toBe(2);
        })
        it('sets scope.done_assignments to those of scope.currentUser', function(){
            expect(scope.done_assignments.length).toBe(1);
        })
    })


    describe('viewAsStudent', function() {

        it('changes currentUser to the student which is given as parameter', function () {
            expect(scope.currentUser.id).toBe(2)
            scope.viewAsStudent({"id": 3});

            expect(scope.currentUser.id).toBe(3);
        });

        it('sets done_assignments when user is valid', function () {
            expect(scope.done_assignments.length).not.toBe(3);
            scope.viewAsStudent(scope.participants[0]);

            expect(scope.done_assignments.length).toBe(3);
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
            it('calls on httpService.postData with assignment id, current user id and path students_tasks', function(){
                scope.markAssignmentAsDone(undoneAssignment);
                var data2 = {assignment_id: 2, user_id: scope.currentUser.id}
                expect(httpServiceMock.postData).toHaveBeenCalledWith("students_tasks", data2);
            })
            it('sets them as done', function(){
                scope.markAssignmentAsDone(undoneAssignment);
                expect(scope.done_assignments.indexOf(undoneAssignment)).not.toBe(-1);
            })
            it('increases the assignment doers', function(){
                expect(undoneAssignment.doers.length).toBe(1);
                scope.markAssignmentAsDone(undoneAssignment);
                expect(undoneAssignment.doers.length).toBe(2);
            })
        })
        describe('when done', function(){
            it('calls on httpService.postData with assignment id, current user id and path students_tasks/destroy', function(){
                scope.markAssignmentAsUndone(doneAssignment);
                var data2 = {assignment_id: 1, user_id: scope.currentUser.id}
                expect(httpServiceMock.postData).toHaveBeenCalledWith("students_tasks/destroy", data2);
            })
            it ('sets them as undone', function(){
                scope.markAssignmentAsUndone(doneAssignment);
                expect(scope.done_assignments.indexOf(doneAssignment)).toBe(-1);
            })
            it('decreases the assignment doers', function(){
                expect(doneAssignment.doers.length).toBe(2);
                scope.markAssignmentAsUndone(doneAssignment);
                expect(doneAssignment.doers.length).toBe(1);
            })
        })

    })

    describe('moveToCourseCreationView', function(){
        it ('should call StateService.setCurrentUser with correct value', function(){
            scope.moveToCourseCreationView();
            expect(StateServiceMock.setCurrentUser).toHaveBeenCalledWith(scope.currentUser);
        })
    })

    describe('moveToCourseEditView', function(){
        it ('should call StateService.setCurrentCourse with correct value', function(){
            scope.moveToCourseEditView();
            expect(StateServiceMock.setCurrentCourse).toHaveBeenCalledWith(scope.course);
        })
    })
})