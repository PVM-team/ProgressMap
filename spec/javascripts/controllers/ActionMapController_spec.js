describe('actionMapController', function () {
    var controller, scope;
    var CanvasServiceMock;
    var httpServiceMock;
    var StateServiceMock;
    var location;
   
    beforeEach(function () {
        module('ProgressApp');

        //leikkii backendiä, palauttaa testejä varten esimerkkidatan
        httpServiceMock = (function () {
            var data = {};

            data.course = [{"id": 1}];
            data.assignments =
                [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}], "students_tasks": [{"user_id": 1, "timestamp": 2014}, {"user_id": 2, "timestamp": 2015}], "number": 1},
                    {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 1}], "students_tasks": [{"user_id": 1, "timestamp": 2013}], "number": 2},
                    {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}], "students_tasks": [{"user_id": 1, "timestamp": 2015}], "number": 3}];
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
            var course;
            return {
                setCurrentCourse: function(currentCourse){
                    course = currentCourse;
                }
            }
        })();



        spyOn(StateServiceMock, 'setCurrentCourse').and.callThrough();
        spyOn(CanvasServiceMock, 'initiateCanvas').and.callThrough();
        spyOn(httpServiceMock, 'getData').and.callThrough();
        spyOn(httpServiceMock, 'postData').and.callThrough();
        spyOn(CanvasServiceMock, 'drawSmoothPaths').and.callThrough();


        inject(function ($controller, $rootScope, $routeParams, httpService, CanvasService, StateService, $location) {
            scope = $rootScope.$new();
            location = $location;
            spyOn(location, 'path');
            controller = $controller('actionMapController', {
                $scope: scope,
                $routeParams: $routeParams,
                httpService: httpServiceMock,
                CanvasService: CanvasServiceMock,
                StateService: StateServiceMock
            });

        });

    });

    describe ('initializing actionMapController retrieves data from httpService', function(){

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
        it('sets scope.latestDoersForAssignments to include the students on that task', function(){
            //student with id 2 is the latest to do task with number 1
            expect(scope.latestDoersForAssignments[1].listOfStudentLocations.length).toBe(1);
            expect(scope.latestDoersForAssignments[1].listOfStudentLocations[0].student.id).toBe(2);

            expect(scope.latestDoersForAssignments[2].listOfStudentLocations.length).toBe(0);

            //student with id 1 is the latest to do task with number 3
            expect(scope.latestDoersForAssignments[3].listOfStudentLocations.length).toBe(1);
            expect(scope.latestDoersForAssignments[3].listOfStudentLocations[0].student.id).toBe(1);
        })
    })
    
    describe('goToNormalMap', function(){
        it('should call location.path when function is called', function(){
            scope.goToNormalMap();
             expect(location.path).toHaveBeenCalledWith('/map/1');
        })
    });
})
