/*describe('ActionMapUpdaterService', function () {
    var service;
    var assignments;
    var students;
    var pathLayer;
    var assignmentLayer;
    var studentLayer;
    var percentageLayer;
    var labelLayer;
    var mapScale;
    var assignmentLatestDoers;
    var moveStudentCircle;
    var studentIcon;
    var assignmentCircle;

    beforeEach(function () {
        module('ProgressApp');

        students = [{"id": 1, "lastDoneAssignment": null, location: {},  reserved: false},
            {"id": 2, "lastDoneAssignment": {"number": 1, "timestamp": 9}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 3, "lastDoneAssignment": {"number": 1, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 4, "lastDoneAssignment": {"number": 1, "timestamp": 7}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 5, "lastDoneAssignment": {"number": 1, "timestamp": 6}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 6, "lastDoneAssignment": {"number": 2, "timestamp": 5}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 7, "lastDoneAssignment": {"number": 2, "timestamp": 6}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 8, "lastDoneAssignment": {"number": 1, "timestamp": 5}, location: {x: 146.5909090909091, y: 250}, reserved: false},
            {"id": 9, "lastDoneAssignment": {"number": 3, "timestamp": 8}, location: {x: 546.5909090909091, y: 130}, reserved: false},
            {"id": 10, "lastDoneAssignment": {"number": 2, "timestamp": 9}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 11, "lastDoneAssignment": {"number": 2, "timestamp": 10}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 12, "lastDoneAssignment": {"number": 3, "timestamp": 11}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 13, "lastDoneAssignment": {"number": 4, "timestamp": 1}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 14, "lastDoneAssignment": {"number": 4, "timestamp": 2}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 15, "lastDoneAssignment": {"number": 4, "timestamp": 3}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 16, "lastDoneAssignment": {"number": 4, "timestamp": 4}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 17, "lastDoneAssignment": {"number": 4, "timestamp": 5}, location: {"x": 1, "y":1}, reserved: false},];


        assignments = [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "number": 1, "latestDoers": [students[1], students[2], students[3], students[4], students[7]]},
            {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "latestDoers": [students[5], students[6] , students[9], students[10]], "number": 2},
            {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "latestDoers": [students[8], students[11]], "number": 3},
            {"id": 4, "location": {"id": 4, "x": 850, "y": 88}, "latestDoers": [students[12], students[13], students[14]], "number": 4}];

        inject(function (_ActionMapUpdaterService_, MapScaleService, AssignmentLatestDoersService, AssignmentCirclesService, MoveStudentCircleService, StudentIconService) {
            service = _ActionMapUpdaterService_;
            pathLayer = new paper.Layer();
            assignmentLayer = new paper.Layer();
            studentLayer = new paper.Layer();
            percentageLayer = new paper.Layer();
            labelLayer = new paper.Layer();
            mapScale = MapScaleService;
            assignmentLatestDoers = AssignmentLatestDoersService;
            assignmentCircle = AssignmentCirclesService;
            moveStudentCircle = MoveStudentCircleService;
            studentIcon = StudentIconService;
        });
    });
})
 */