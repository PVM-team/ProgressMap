describe('MoveStudentIconService', function () {
    var assignments;
    var students;
    var studentinfo;
    var circle;
    var destination;
    var MapScaleServiceMock;

    beforeEach(function () {
        module('ProgressApp');

        students = [{"id": 1,  "lastDoneAssignment": null, location: {},  reserved: false, leaving: false, dummy: false},
            {"id": 2,  "lastDoneAssignment": {"number": 1, "timestamp": 9}},
            {"id": 3,  "lastDoneAssignment": {"number": 1, "timestamp": 8}},
            {"id": 4,  "lastDoneAssignment": {"number": 1, "timestamp": 7}},
            {"id": 5,  "lastDoneAssignment": {"number": 1, "timestamp": 6}},
            {"id": 6,  "lastDoneAssignment": {"number": 2, "timestamp": 5}},
            {"id": 7,  "lastDoneAssignment": {"number": 2, "timestamp": 6}},
            {"id": 8,  "lastDoneAssignment": {"number": 1, "timestamp": 5}},
            {"id": 9,  "lastDoneAssignment": {"number": 3, "timestamp": 8}},
            {"id": 10, "lastDoneAssignment": {"number": 2, "timestamp": 9}},
            {"id": 11, "lastDoneAssignment": {"number": 2, "timestamp": 10}},
            {"id": 12, "lastDoneAssignment": {"number": 3, "timestamp": 11}},
            {"id": 13, "lastDoneAssignment": {"number": 4, "timestamp": 1}},
            {"id": 14, "lastDoneAssignment": {"number": 4, "timestamp": 2}},
            {"id": 15, "lastDoneAssignment": {"number": 4, "timestamp": 3}},
            {"id": 16, "lastDoneAssignment": {"number": 4, "timestamp": 4}},
            {"id": 17, "lastDoneAssignment": {"number": 4, "timestamp": 5}},
            {"id": 18, "lastDoneAssignment": {"number": 4, "timestamp": 8}},
            {"id": 19, "lastDoneAssignment": {"number": 4, "timestamp": 8}},
            {"id": 20, "lastDoneAssignment": {"number": 4, "timestamp": 8}},
            {"id": 21, "lastDoneAssignment": {"number": 4, "timestamp": 8}},
            {"id": 22, "lastDoneAssignment": {"number": 4, "timestamp": 8}}];

        studentinfo = [{"id": 1,  "lastDoneAssignment": null, location: {},  reserved: false, leaving: false, dummy: false},
            {"id": 2,  "lastDoneAssignment": {"number": 1, "timestamp": 9}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 3,  "lastDoneAssignment": {"number": 1, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 4,  "lastDoneAssignment": {"number": 1, "timestamp": 7}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 5,  "lastDoneAssignment": {"number": 1, "timestamp": 6}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 6,  "lastDoneAssignment": {"number": 2, "timestamp": 5}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 7,  "lastDoneAssignment": {"number": 2, "timestamp": 6}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 8,  "lastDoneAssignment": {"number": 1, "timestamp": 5}, location: {x: 146.5909090909091, y: 250}, reserved: false, leaving: false, dummy: false},
            {"id": 9,  "lastDoneAssignment": {"number": 3, "timestamp": 8}, location: {x: 546.5909090909091, y: 130}, reserved: false, leaving: false, dummy: false},
            {"id": 10, "lastDoneAssignment": {"number": 2, "timestamp": 9}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 11, "lastDoneAssignment": {"number": 2, "timestamp": 10}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 12, "lastDoneAssignment": {"number": 3, "timestamp": 11}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 13, "lastDoneAssignment": {"number": 4, "timestamp": 1}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 14, "lastDoneAssignment": {"number": 4, "timestamp": 2}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 15, "lastDoneAssignment": {"number": 4, "timestamp": 3}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 16, "lastDoneAssignment": {"number": 4, "timestamp": 4}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 17, "lastDoneAssignment": {"number": 4, "timestamp": 5}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 18, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 19, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 20, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 21, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 22, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false}]

        assignments = [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "latestDoers": [studentinfo[1], studentinfo[2], studentinfo[3], studentinfo[4], studentinfo[7]], "number": 1},
            {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "latestDoers": [studentinfo[5], studentinfo[6] , studentinfo[9], studentinfo[10]], "number": 2},
            {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "latestDoers": [studentinfo[8], studentinfo[11]], "number": 3},
            {"id": 4, "location": {"id": 4, "x": 850, "y": 88}, "latestDoers": [studentinfo[12], studentinfo[13], studentinfo[14]], "number": 4}];
       
        circle = {
            position: {
                x: 50,
                y: 50
            }
        };

        destination = {
            x: 100,
            y: 100
        };
        
        MapScaleServiceMock = (function () {
            return {
                getRelativeXFromDefaultSize: function (x) {
                    return x*10000
                }
            }
        })();

    spyOn(MapScaleServiceMock, 'getRelativeXFromDefaultSize').and.callThrough();

        inject(function (_MoveStudentIconService_, MapScaleService) {
            service = _MoveStudentIconService_;
            MapScaleService = MapScaleServiceMock;
        });

    });


    describe('calls correct functions', function(){
        it('calls distanceToDestination when hasReahchedDestination is called', function() {
            service.hasReachedDestination(circle, destination);
            expect(service.distanceToDestination).toHaveBeenCalled;

        });

        it('calls another function', function(){
            service.approachingDestination(circle, destination);
            expect(service.distanceToDestination).toHaveBeenCalled;
        });

    });


})

