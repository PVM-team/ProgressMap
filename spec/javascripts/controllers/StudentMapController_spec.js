describe('StudentMapController', function () {

    var controller, scope;
    var CanvasServiceMock;
    var httpServiceMock;
    var StateServiceMock;
    var location;

    beforeEach(function () {
        module('ProgressApp');

        httpServiceMock = (function () {
            var data = {};

            data.course = [{"id": 1}];
            data.student = [{"id": 1, "firstName": 'Eetu', "lastName": "Esimerkki", "token": "eetu-123-esimerkki"}];

            data.assignments = [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 1}, {"id": 2}], "number": 1},
                                {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 2}], "number": 2},
                                {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}], "number": 3}];

            return {
                getData: function(path, params) {
                    return{
                        then: function(callback) {
                            return callback(data);
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
        spyOn(httpServiceMock, 'getData').and.callThrough();
        spyOn(CanvasServiceMock, 'initiateCanvas').and.callThrough();
        spyOn(CanvasServiceMock, 'drawSmoothPaths').and.callThrough();


        inject(function ($controller, $rootScope, $routeParams, httpService, CanvasService, StateService, $location) {
            scope = $rootScope.$new();
            location = $location;
            spyOn(location, 'path');
            controller = $controller('StudentMapController', {
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

    describe ('initializing StudentMapController retrieves data from httpService', function(){
        it('sets scope.course.id to 1', function(){
            expect(scope.course.id).toBe(1);
        })
        it('sets scope.student to Eetu Esimerkki', function(){
            expect(scope.student.id).toBe(1)
            expect(scope.student.firstName).toEqual("Eetu")
            expect(scope.student.lastName).toEqual("Esimerkki")
            expect(scope.student.token).toEqual("eetu-123-esimerkki")
        })
        it('sets scope.assignments to what httpService returns', function(){
            expect(scope.assignments.length).toBe(3);
            expect(scope.assignments[0].id).toBe(1);
            expect(scope.assignments[1].location.x).toBe(330);
            expect(scope.assignments[2].doers.length).toBe(1);
        })
        it('sets scope.done_assignments to those of scope.student', function(){
            expect(scope.done_assignments.length).toBe(2);
            expect(scope.done_assignments[0].id).toBe(1)
            expect(scope.done_assignments[1].id).toBe(3)
        })
    })

    describe('assignmentCompleted returns', function() {

        it ('true if student has done the assignment', function () {
            expect(scope.assignmentCompleted(scope.assignments[0])).toBe(true)
        })

        it ('false if student has not done the assignment', function () {
            expect(scope.assignmentCompleted(scope.assignments[1])).toBe(false);
        })
    })

    describe('goToActionMap', function(){
        it('should call location.path when function is called', function(){
            scope.moveToActionMap();
            expect(location.path).toHaveBeenCalledWith('/actionmap/1');
        })
    });
})
