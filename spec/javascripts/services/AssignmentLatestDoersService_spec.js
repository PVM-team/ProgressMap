describe('AssignmentLatestDoersService', function () {
    var service;
    var assignments;
    var students;
    var studentinfo;

    beforeEach(function () {
        module('ProgressApp');

        students = [{"id": 1},
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

        studentinfo = [{"id": 1,  "lastDoneAssignment": null, location: {}},
            {"id": 2,  "lastDoneAssignment": {"number": 1, "timestamp": 9}, location: {"x": 1, "y":1}},
            {"id": 3,  "lastDoneAssignment": {"number": 1, "timestamp": 8}, location: {"x": 1, "y":1}},
            {"id": 4,  "lastDoneAssignment": {"number": 1, "timestamp": 7}, location: {"x": 1, "y":1}},
            {"id": 5,  "lastDoneAssignment": {"number": 1, "timestamp": 6}, location: {"x": 1, "y":1}},
            {"id": 6,  "lastDoneAssignment": {"number": 2, "timestamp": 5}, location: {"x": 1, "y":1}},
            {"id": 7,  "lastDoneAssignment": {"number": 2, "timestamp": 6}, location: {"x": 1, "y":1}},
            {"id": 8,  "lastDoneAssignment": {"number": 1, "timestamp": 5}, location: {x: 146.5909090909091, y: 250}},
            {"id": 9,  "lastDoneAssignment": {"number": 3, "timestamp": 8}, location: {x: 546.5909090909091, y: 130}},
            {"id": 10, "lastDoneAssignment": {"number": 2, "timestamp": 9}, location: {"x": 1, "y":1}},
            {"id": 11, "lastDoneAssignment": {"number": 2, "timestamp": 10}, location: {"x": 1, "y":1}},
            {"id": 12, "lastDoneAssignment": {"number": 3, "timestamp": 11}, location: {"x": 1, "y":1}},
            {"id": 13, "lastDoneAssignment": {"number": 4, "timestamp": 1}, location: {"x": 1, "y":1}},
            {"id": 14, "lastDoneAssignment": {"number": 4, "timestamp": 2}, location: {"x": 1, "y":1}},
            {"id": 15, "lastDoneAssignment": {"number": 4, "timestamp": 3}, location: {"x": 1, "y":1}},
            {"id": 16, "lastDoneAssignment": {"number": 4, "timestamp": 4}, location: {"x": 1, "y":1}},
            {"id": 17, "lastDoneAssignment": {"number": 4, "timestamp": 5}, location: {"x": 1, "y":1}},
            {"id": 18, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}},
            {"id": 19, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}},
            {"id": 20, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}},
            {"id": 21, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}},
            {"id": 22, "lastDoneAssignment": {"number": 4, "timestamp": 8}, location: {"x": 1, "y":1}}]

        assignments = [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "latestDoers": [studentinfo[1], studentinfo[2], studentinfo[3], studentinfo[4], studentinfo[7]], "number": 1},
            {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "latestDoers": [studentinfo[5], studentinfo[6] , studentinfo[9], studentinfo[10]], "number": 2},
            {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "latestDoers": [studentinfo[8], studentinfo[11]], "number": 3},
            {"id": 4, "location": {"id": 4, "x": 850, "y": 88}, "latestDoers": [studentinfo[12], studentinfo[13], studentinfo[14]], "number": 4},
            {"id": 5, "location": {"id": 4, "x": 415, "y": 350}, "latestDoers": [], "number": 5}
        ];

        assignment = undefined;
        student = undefined;

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

    describe('studentIsInLatestDoersOfAssignment', function() {

        beforeEach(function() {
            assignment = {"latestDoers": [{"id": 15}, {"id": 13}]};
        })

        it("should return true if student is in latestDoers of assignment", function() {
            student = {"id": 15};
            expect(service.studentIsInLatestDoersOfAssignment(student, assignment)).toBeTruthy();
        })

        it("should return false if student is not in latestDoers of assignment", function() {
            student = {"id": 12};
            expect(service.studentIsInLatestDoersOfAssignment(student, assignment)).toBeFalsy();
        })
    })


    describe('studentShouldBeInLatestDoersofAssignment', function() {

        beforeEach(function() {
            assignment = {"latestDoers": [{"id": 15}, {"id": 13}]};
            student = {"id": 21,  "lastDoneAssignment": {"number": 1, "timestamp": 8}};
        })

        it("should return false if student has no lastDoneAssignment", function() {
            student.lastDoneAssignment = undefined;
            expect(service.studentShouldBeInLatestDoersOfAssignment(student, assignment)).toBeFalsy();            
        })

        it("should return true if latestDoers of assignment is not full", function() {
            expect(service.studentShouldBeInLatestDoersOfAssignment(student, assignment)).toBeTruthy();    
        })

        describe("if latestDoers of assignment is full", function() {

            beforeEach(function() {
                assignment = {"latestDoers": [{"id": 20,  "lastDoneAssignment": {"number": 1, "timestamp": 9}},
                                              {"id": 22,  "lastDoneAssignment": {"number": 1, "timestamp": 10}},
                                              {"id": 24,  "lastDoneAssignment": {"number": 1, "timestamp": 7}},
                                              {"id": 23,  "lastDoneAssignment": {"number": 1, "timestamp": 13}},
                                              {"id": 21,  "lastDoneAssignment": {"number": 1, "timestamp": 14}} ]};
            })

            it("returns true if student has a newer timestamp for lastDoneAssignment than someone in latestDoers", function() {
                student.lastDoneAssignment.timestamp = 8;
                expect(service.studentShouldBeInLatestDoersOfAssignment(student, assignment)).toBeTruthy();

                student.lastDoneAssignment.timestamp = 15;
                expect(service.studentShouldBeInLatestDoersOfAssignment(student, assignment)).toBeTruthy();
            })

            it("return false if student has an older timestamp than any doer in latestDoers of assignment", function() {
                student.lastDoneAssignment.timestamp = 6;
                expect(service.studentShouldBeInLatestDoersOfAssignment(student, assignment)).toBeFalsy();
            })

        })
    })


    describe("setStudentToLeaveItsLastDoneAssignment", function() {

        it("sets leaving attribute to true for student in latestDoers of assignment", function() {
            assignment = {"latestDoers": [{"id": 15}, {"id": 13}]};
            student = {"id": 13,  "lastDoneAssignment": {"number": 1, "timestamp": 8}};

            service.setStudentToLeaveItsLastDoneAssignment(student, assignment);
            expect(assignment.latestDoers[1].leaving).toBeTruthy();
        })
    })


    describe('addStudentToLatestDoersWithLocation', function() {

        it("adds student to latestDoers of assignment and attaches it given position as location", function() {
            assignment = {"latestDoers": [{"id": 15}, {"id": 13}]};
            student = {"id": 22,  "lastDoneAssignment": {"number": 1, "timestamp": 8}};

            service.addStudentToLatestDoersWithLocation(student, assignment, {'x': 100, 'y': 125});
            expect(assignment.latestDoers.length).toBe(3)
            expect(assignment.latestDoers[2].id).toBe(22)
            expect(assignment.latestDoers[2].location).toEqual({'x': 100, 'y': 125});
        })
    })


    describe('removeStudentFromLatestDoersOfAssignmentFromPosition', function() {
        it('should return true if there is student in that location', function() {
            var position = {"x": 1, "y": 1};
            expect(service.removeStudentFromLatestDoersOfAssignmentFromPosition(assignments[2], position)).toBeTruthy();
        })

        it('should return false if there is no student in that location', function() {
            var position = {"x": 66, "y": 66};
            expect(service.removeStudentFromLatestDoersOfAssignmentFromPosition(assignments[2], position)).toBeFalsy();
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
        /*beforeEach(function(){
            for (var i = 0; i < assignments[0].latestDoers.length - 1; i++) {
                assignments[0].latestDoers[i].reserved = true;
            }
        }) */

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

})
