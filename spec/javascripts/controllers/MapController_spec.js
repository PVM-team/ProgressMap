describe('MapController', function () {

    var controller, scope, httpBackend;
    var mapDataService;
    var CanvasServiceMock;
    var data = {};

    beforeEach(function () {
        module('ProgressApp');

        module(function($provide) {
            $provide.value('mapDataService', {
                initMap: function() {
                    return {
                        then: function(callback) {
                        }
                    }
                }
            })
        })
        CanvasServiceMock = (function () {
            return {
                initiateCanvas: function (height, width, div, bgColor) {
                },
                drawSmoothPaths: function (locations) {
                }
            }
        })();

        //luodaan data testaamiselle (joka oikeasti saataisiin palvelusta)
        data.course = [{"id": 1}];
        data.assignments =
            [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}]},
                {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 1}]},
                {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}]}];
        data.participants = [{"id": 1}, {"id": 2}, {"id": 3}];
        data.current_user = [{"id": 2}];

        inject(function ($controller, $rootScope, $httpBackend, _MapDataService_, CanvasService) {
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
            mapDataService = _MapDataService_;
            controller = $controller('MapController', {
                $scope: scope,
                MapDataService: mapDataService,
                CanvasService: CanvasServiceMock
            });

            // spyOn(scope, 'addStudent')
        });

        scope.course = data["course"][0]
        scope.assignments = data["assignments"]
        scope.participants = data["participants"]

        scope.current_user = data["current_user"][0]

        httpBackend.when('GET', '/map/init.json?course_id=1&user_id=2').respond(200, data)
        httpBackend.when('POST', '/users', {'course_id': scope.course.id }).respond(201, data)

        httpBackend.flush()
    });


    describe('viewAsStudent', function() {

        it('changes current_user to the student whose id is given as parameter', function () {
            expect(scope.current_user.id).toBe(2)
            scope.viewAsStudent(3);

            expect(scope.current_user.id).toBe(3);
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


    it('should add a new student to course', function () {
        var amount = scope.participants.length

        httpBackend.expectPOST("/users", {'course_id': scope.course.id })
        scope.addStudent(scope.course);

        httpBackend.flush()
        expect(scope.participants.length).toBe(amount + 1);
    });


   afterEach(function() {
     httpBackend.verifyNoOutstandingExpectation();
     httpBackend.verifyNoOutstandingRequest();
   });

})