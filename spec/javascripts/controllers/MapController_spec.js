describe('MapController', function () {

    var controller, scope;
    var CanvasServiceMock;
    var httpServiceMock;
    var StateServiceMock;

    beforeEach(function () {
        module('ProgressApp');

        //leikkii backendiä, palauttaa testejä varten esimerkkidatan
        httpServiceMock = (function () {
            var data = {};

            data.course = [{"id": 1}];
            data.assignments =
                [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}]},
                    {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 1}]},
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
            return {
                setCurrentUser: function (currentUser) {
                    user = currentUser;
                },
                getCurrentUser: function(){
                    return user;
                }
            }
        })();



        spyOn(StateServiceMock, 'setCurrentUser').and.callThrough();
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

    describe ('initializing MapController retrieves data from MapDataService', function(){
        it('sets scope.course to 1', function(){
            expect(scope.course.id).toBe(1);
        })
        it('sets scope.assignments to what MapDataService returns', function(){
            expect(scope.assignments.length).toBe(3);
            expect(scope.assignments[0].id).toBe(1);
            expect(scope.assignments[1].location.x).toBe(330);
            expect(scope.assignments[2].doers.length).toBe(1);
        })
        it('sets scope.participants to what MapDataService returns', function(){
            expect(scope.participants.length).toBe(3);
            expect(scope.participants[0].id).toBe(1);
            expect(scope.done_assignments.length).toBe(1);
        })
        it('sets scope.currentUser to what MapDataService returns', function(){
            expect(scope.currentUser.id).toBe(2);
        })
        it('sets scope.done_assignments to those of scope.currentUser', function(){
            expect(scope.done_assignments.length).toBe(1);
        })
    })


    describe('viewAsStudent', function() {

        it('changes currentUser to the student whose id is given as parameter', function () {
            expect(scope.currentUser.id).toBe(2)
            scope.viewAsStudent(3);

            expect(scope.currentUser.id).toBe(3);
        });

        it('sets done_assignments when userId is valid', function () {
            expect(scope.done_assignments.length).not.toBe(3);
            scope.viewAsStudent(scope.participants[0].id);

            expect(scope.done_assignments.length).toBe(3);
        });
    })

    describe('assignmentCompleted returns', function() {

        it ('true if student has done the assignment', function () {
            scope.viewAsStudent(2)
            expect(scope.assignmentCompleted(scope.done_assignments[0].id)).toBe(true)
        })

        it ('false if student has not done the assignment', function () {
            scope.viewAsStudent(3);
            expect(scope.assignmentCompleted(scope.assignments[3])).toBe(false);
        })
    })

    /* describe('addStudent', function (){

        it ('should call on httpService.postData', function(){
            scope.addStudent();
            expect(httpServiceMock.postData).toHaveBeenCalled();
        })

        it('should add a new student to course currently selected', function () {
            var amount = scope.participants.length;
            scope.addStudent();
            expect(scope.participants.length).toBe(amount+1);

        });
    }) */

    describe('moveToCourseCreationView', function(){
        it ('should call StateService.setCurrentUser with correct value', function(){
            scope.moveToCourseCreationView();
            expect(StateServiceMock.setCurrentUser).toHaveBeenCalledWith(scope.currentUser);
        })
    })
})