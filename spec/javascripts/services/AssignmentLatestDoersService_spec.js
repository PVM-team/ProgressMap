describe('AssignmentLatestDoersService', function () {
    var service;
    var assignments;
    var students;
    var PaperMock;

    beforeEach(function () {
        module('ProgressApp');

        students = [{"id": 1,  "lastDoneAssignment": null, location: {},  reserved: false},
            {"id": 2,  "lastDoneAssignment": {"number": 1, "timestamp": 9}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 3,  "lastDoneAssignment": {"number": 1, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 4,  "lastDoneAssignment": {"number": 1, "timestamp": 7}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 5,  "lastDoneAssignment": {"number": 1, "timestamp": 6}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 6,  "lastDoneAssignment": {"number": 2, "timestamp": 5}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 7,  "lastDoneAssignment": {"number": 2, "timestamp": 6}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 8,  "lastDoneAssignment": {"number": 1, "timestamp": 5}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 9,  "lastDoneAssignment": {"number": 3, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 10, "lastDoneAssignment": {"number": 2, "timestamp": 9}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 11, "lastDoneAssignment": {"number": 2, "timestamp": 10}, location: {"x": 1, "y":1}, reserved: false},
            {"id": 12, "lastDoneAssignment": {"number": 3, "timestamp": 11}, location: {"x": 1, "y":1}, reserved: false} ];


        assignments = [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "number": 1, "latestDoers": [students[1], students[2], students[3], students[4], students[7]]},
            {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "latestDoers": [students[5], students[6] , students[9], students[10]], "number": 2},
            {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "latestDoers": [students[8], students[11]], "number": 3} ];

        PaperMock = (function () {
            return {
                hitTest: function (position) {
                    return false;
                }
            }
        })();

        inject(function (_AssignmentLatestDoersService_) {
            service = _AssignmentLatestDoersService_;
            PaperMock = paper;
        });
    });

    describe('latestDoersFull', function(){
        it('should return true if there is 5 or more latestDoers for the assignment', function() {
            expect(service.latestDoersFull(assignments[0])).toBeTruthy()
        })

        it('should return false if there is 5 or less latestDoers for the assignment', function() {
            expect(service.latestDoersFull(assignments[1])).toBeFalsy()
        })
    })

    describe('originalAssignment', function() {
        it('should return correct assignment if student has last done assignment', function() {
            expect(service.originalAssignment(students[8], assignments)).toEqual(assignments[2]);
        })

        it('should return null if student has no last done assignment', function() {
            expect(service.originalAssignment(students[0], assignments)).toBeNull();
        })
    })

    describe('studentShouldBeInLatestDoersofAssignment', function() {
        it("should return true if assignment's latestDoers is less than maxStudentsToShowAroundAssignment", function() {
            expect(service.studentShouldBeInLatestDoersOfAssignment(students[1], assignments[1])).toBeTruthy();
        })
        it('should return false if student has no last done assignment', function() {
            expect(service.studentShouldBeInLatestDoersOfAssignment(students[0], assignments[1])).toBeFalsy();
        })
        it("should return true if first student has done last done assignment after the second one", function() {
            expect(service.studentShouldBeInLatestDoersOfAssignment(students[2], assignments[0])).toBeTruthy();
        })
    })

    describe('addStudentToLatestDoersWithLocation', function() {
        it ('should return correct position after add', function() {
//            var position = service.nextPositionToMoveToAroundAssignment(students[0], assignments[2]); tarvii paper hittestin
            var position = {"x": 666, "y": 666};
            service.addStudentToLatestDoersWithLocation(students[1], assignments[2], position);
            var assignment = assignments[2];
            expect(assignment.latestDoers[assignment.latestDoers.length - 1].location).toEqual(position);
        })
    })

    describe('studentToAddInPlaceOfRemovedOne', function() {
        it('should remove oldest student from latest doers', function() {
            var amount = assignments[0].latestDoers.length;
            expect(assignments[0].latestDoers[amount - 1]).toEqual(students[7]);
            service.removeTheOldestStudentFromLatestDoers(assignments[0]);
            expect(assignments[0].latestDoers.length).toEqual(amount - 1);
            expect(assignments[0].latestDoers[amount - 2]).toEqual(students[4]);
            expect(service.studentToAddInPlaceOfRemovedOne(assignments[0], students)).toEqual(students[7]);
        })
    })

    describe('freePosition', function() {
        it('should set reserved to false if locations are same', function() {
            var position = {"x": 1, "y": 1};
            service.freePosition(assignments[0], position);
            expect(assignments[0].latestDoers[0].reserved).toBeFalsy();
        })
    })

    describe('nextPositionToMoveToAroundAssignment', function() {
        beforeEach(function(){
            for (var i = 0; i < assignments[0].latestDoers.length - 1; i++) {
                assignments[0].latestDoers[i].reserved = true;
            }
        })
        it('should return correct position if some positions are not reserved', function() {
            var position = {"x": 1, "y": 1};
            expect(service.nextPositionToMoveToAroundAssignment(students[1], assignments[0])).toEqual(position);
        })
        it('should return correct position if all positions are reserved', function() {
            var position = {"x": 1, "y": 1};
            assignments[0].latestDoers[4].reserved = true;
            expect(service.nextPositionToMoveToAroundAssignment(students[1], assignments[0])).toEqual(position);
        })
    })
})
