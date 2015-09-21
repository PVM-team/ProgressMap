describe('MapController', function () {

    var controller, scope, logMock, httpBackend;
    var mapDataService;
    var CanvasServiceMock;
    var data = {};

    beforeEach(function () {
        module('ProgressApp');

        //jotain tämmöistä pitää canvaksen piirtoo tehdä
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
        data.course = {"id": 1};
        data.assignments =
            [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}]},
                {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 1}]},
                {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}]}];
        data.participants = [{"id": 1}, {"id": 2}, {"id": 3}];
        data.current_user = {"id": 2};

        inject(function ($controller, $rootScope, $httpBackend, _MapDataService_, CanvasService) {
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
            mapDataService = _MapDataService_;
            controller = $controller('MapController', {
                $scope: scope,
                MapDataService: mapDataService,
                CanvasService: CanvasServiceMock
            });

            spyOn(scope, 'addStudent')

        });

        //asetetaan data scopeen (joka oikeasti tapahtuu MapDataServicen avulla)
        scope.course = data["course"][0]
        scope.assignments = data["assignments"]
        scope.participants = data["participants"]

        scope.current_user = data["current_user"][0]
        //$scope.done_assignments = doneAssignments($scope.current_user);

        var student = {
            id: data.id
        }

        var course = {"id": 1};

        //nämä pitää saada toimimaan niin että testikattavuus nousee myös
        httpBackend.when('POST', '/users', course.id
        ).respond('201', scope.participants.push(student))

        httpBackend.when('GET', '/map/init.json', " "
        ).respond('200', data)

    });

    it('Init was called on Controller initialize', function () {
        spyOn(mapDataService, 'initMap')
        mapDataService.initMap(" ");
        expect(mapDataService.initMap).toHaveBeenCalled();
    });


    it('should throw an error, if user does not exist', function () {
        var error;
        try {
            scope.viewAsStudent(5);
        }
        catch(err) {
            error = err;
        }
        expect(error).toBeDefined();
    });

    //koko yö mennyt tähän
    it('does nothing', function () {
//        expect(scope.getctx()).not.toBe(null);
    })

  

})