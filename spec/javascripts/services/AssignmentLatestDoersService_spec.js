describe('AssignmentLatestDoersService', function () {
    var service;
    var assignments;
    var students;

    beforeEach(function () {
        module('ProgressApp');

        inject(function (_AssignmentLatestDoersService_) {
            service = _AssignmentLatestDoersService_
        });

        students = [{"id": 1,  "lastDoneAssignment": null},
            {"id": 2,  "lastDoneAssignment": {"number": 1, "timestamp": 1}},
            {"id": 3,  "lastDoneAssignment": {"number": 1, "timestamp": 2}},
            {"id": 4,  "lastDoneAssignment": {"number": 1, "timestamp": 3}},
            {"id": 6,  "lastDoneAssignment": {"number": 1, "timestamp": 4}},
            {"id": 7,  "lastDoneAssignment": {"number": 2, "timestamp": 5}},
            {"id": 5,  "lastDoneAssignment": {"number": 2, "timestamp": 6}},
            {"id": 8,  "lastDoneAssignment": {"number": 1, "timestamp": 7}},
            {"id": 9,  "lastDoneAssignment": {"number": 3, "timestamp": 8}},
            {"id": 10, "lastDoneAssignment": {"number": 2, "timestamp": 9}},
            {"id": 11, "lastDoneAssignment": {"number": 2, "timestamp": 10}},
            {"id": 12, "lastDoneAssignment": {"number": 3, "timestamp": 11}} ];


        assignments = [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "number": 1, "latestDoers": [students[1], students[2], students[3], students[4], students[7]]},
            {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "latestDoers": [students[5], students[6]], "number": 2},
            {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "number": 3} ];
    });

    describe ('latestDoersFull', function(){
        it('should return true if there is 5 or more latestDoers for the assignment', function(){
            expect(service.latestDoersFull(assignments[0])).toBeTruthy()
        })

        it('should return false if there is 5 or less latestDoers for the assignment', function(){
            expect(service.latestDoersFull(assignments[1])).toBeFalsy()
        })
    })
})
