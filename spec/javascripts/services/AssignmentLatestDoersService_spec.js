describe('AssignmentLatestDoersService', function () {
    var service;
    var assignments;
    var students;
    var studentinfo;

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

        inject(function (_AssignmentLatestDoersService_) {
            service = _AssignmentLatestDoersService_;
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
            var position = {"x": 666, "y": 666};
            service.addStudentToLatestDoersWithLocation(students[1], assignments[2], position);
            var assignment = assignments[2];
            expect(assignment.latestDoers[assignment.latestDoers.length - 1].location).toEqual(position);
        })
    })

    describe('studentToAddInPlaceOfRemovedOne', function() {
        it('should remove oldest student from latest doers', function() {
            var amount = assignments[0].latestDoers.length;
            service.removeStudentFromLatestDoersOfAssignment(students[7], assignments[0]);
            expect(assignments[0].latestDoers.length).toEqual(amount - 1);
            expect(service.studentToAddInPlaceOfRemovedOne(assignments[0], students)).toEqual(students[7]);
        })

        it('first student has done last done assignment after the second one', function() {
            service.removeStudentFromLatestDoersOfAssignment(students[12], assignments[3]);
            expect(service.studentToAddInPlaceOfRemovedOne(assignments[3], students)).toEqual(students[17]);
        })
    })

    describe('nextPositionToMoveToAroundAssignment', function() {
        beforeEach(function(){
            for (var i = 0; i < assignments[0].latestDoers.length - 1; i++) {
                assignments[0].latestDoers[i].reserved = true;
            }
        })
        it('should return correct position if all positions are reserved', function() {
            var position = {x: 146.5909090909091, y: 250};
            assignments[0].latestDoers[4].reserved = true;
            expect(service.nextPositionToMoveToAroundAssignment(students[1], assignments[0])).toEqual(position);
        })

        it('should return correct position if atleast 1 student leaving', function() {
            var position = {x: 144.95454545454544, y: 250};
            service.setStudentToLeaveItsLastDoneAssignment(assignments[0].latestDoers[4], assignments[0]);
            expect(service.nextPositionToMoveToAroundAssignment(students[0], assignments[0])).toEqual(position);
        })

        it('should return correct position if positions are the same', function() {
            var position = {x: 544.9545454545455, y: 130};
            expect(service.nextPositionToMoveToAroundAssignment(students[0], assignments[2])).toEqual(position);
        })

        it('should return correct positions in complex scenario', function() {
            service.setStudentToLeaveItsLastDoneAssignment(students[1], assignments[0]);
            service.removeStudentFromLatestDoersOfAssignment(students[1], assignments[0]);
        })
    })

    describe('removeStudentFromLatestDoersOfAssignmentWithPosition', function() {
        it('should return true if there is student in that location', function() {
            var position = {"x": 1, "y": 1};
            expect(service.removeStudentFromLatestDoersOfAssignmentFromPosition(assignments[2], position)).toBeTruthy();
        })

        it('should return false if there is no student in that location', function() {
            var position = {"x": 66, "y": 66};
            expect(service.removeStudentFromLatestDoersOfAssignmentFromPosition(assignments[2], position)).toBeFalsy();
        })
    })

})
