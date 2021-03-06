describe('AssignmentLatestAttemptersService', function ($provide) {
    var service;
    var mapScaleServiceMock;

    var assignments;
    var students;
    var studentinfo;

    beforeEach(function () {
        module('ProgressApp');

        assignment = {};
        student = {};
        students = [];

        mapScaleServiceMock = (function() {

            return {
                getRelativeXFromDefaultSize: function(x) {
                    return x;
                }
            }
        })();

        module(function($provide) {
            $provide.value('MapScaleService', mapScaleServiceMock)  // sets MapScaleService as mapScaleServiceMock
        })

        inject(function (_AssignmentLatestAttemptersService_) {
            service = _AssignmentLatestAttemptersService_;
        })
    });

    describe("latestAttemptersFull", function(){
        it('should return true if there is 9 or more latestAttempters for the assignment', function() {
            assignment.latestAttempters = [{"id": 15}, {"id": 13}, {"id": 10}, {"id": 14}, {"id": 18}, {"id": 9}, {"id": 31}, {"id": 34}, {"id": 28}];
            expect(service.latestAttemptersFull(assignment)).toBeTruthy();
        })

        it('should return false if there is 8 or less latestAttempters for the assignment', function() {
            assignment.latestAttempters = [{"id": 15}, {"id": 13}, {"id": 10}, {"id": 14}, {"id": 25}, {"id": 23}, {"id": 20}, {"id": 24}];
            expect(service.latestAttemptersFull(assignment)).toBeFalsy();
        })
    })


    describe("studentIsInLatestAttemptersOfAssignment", function() {

        beforeEach(function() {
            assignment.latestAttempters = [{"id": 15}, {"id": 13}];
        })

        it("should return true if student is in latestAttempters of assignment", function() {
            student.id = 15;
            expect(service.studentIsInLatestAttemptersOfAssignment(student, assignment)).toBeTruthy();
        })

        it("should return false if student is not in latestAttempters of assignment", function() {
            student.id = 12;
            expect(service.studentIsInLatestAttemptersOfAssignment(student, assignment)).toBeFalsy();
        })
    })


    describe("studentShouldBeInLatestAttemptersofAssignment", function() {

        beforeEach(function() {
            assignment.latestAttempters = [{"id": 15}, {"id": 13}];
            student.id = 21;
            student.lastDoneAssignment = {"number": 1, "timestamp": 8};
        })

        it("should return false if student has no lastDoneAssignment", function() {
            student.lastDoneAssignment = undefined;
            expect(service.studentShouldBeInLatestAttemptersOfAssignment(student, assignment)).toBeFalsy();            
        })

        it("should return true if latestAttempters of assignment is not full", function() {
            expect(service.studentShouldBeInLatestAttemptersOfAssignment(student, assignment)).toBeTruthy();    
        })

        describe("if latestAttempters of assignment is full", function() {

            beforeEach(function() {
                assignment.latestAttempters = [{"id": 20,  "lastDoneAssignment": {"number": 1, "timestamp": 9}},
                                          {"id": 22,  "lastDoneAssignment": {"number": 1, "timestamp": 10}},
                                          {"id": 24,  "lastDoneAssignment": {"number": 1, "timestamp": 7}},
                                          {"id": 23,  "lastDoneAssignment": {"number": 1, "timestamp": 13}},
                                          {"id": 21,  "lastDoneAssignment": {"number": 1, "timestamp": 14}},
                                          {"id": 26,  "lastDoneAssignment": {"number": 1, "timestamp": 25}},
                                          {"id": 28,  "lastDoneAssignment": {"number": 1, "timestamp": 23}},
                                          {"id": 33,  "lastDoneAssignment": {"number": 1, "timestamp": 34}},
                                          {"id": 34,  "lastDoneAssignment": {"number": 1, "timestamp": 19}}, ];
            })

            it("returns true if student has a newer timestamp for lastDoneAssignment than someone in latestAttempters", function() {
                student.lastDoneAssignment.timestamp = 8;
                expect(service.studentShouldBeInLatestAttemptersOfAssignment(student, assignment)).toBeTruthy();

                student.lastDoneAssignment.timestamp = 15;
                expect(service.studentShouldBeInLatestAttemptersOfAssignment(student, assignment)).toBeTruthy();
            })

            it("return false if student has an older timestamp than any doer in latestAttempters of assignment", function() {
                student.lastDoneAssignment.timestamp = 6;
                expect(service.studentShouldBeInLatestAttemptersOfAssignment(student, assignment)).toBeFalsy();
            })
        })
    })


    describe("setStudentToLeaveItsLastDoneAssignment", function() {

        it("sets leaving attribute to true for student in latestAttempters of assignment", function() {
            assignment.latestAttempters = [{"id": 15}, {"id": 13}];
            student.id = 13;
            student.lastDoneAssignment = {"number": 1, "timestamp": 8};

            service.setStudentToLeaveItsLastDoneAssignment(student, assignment);

            expect(assignment.latestAttempters[0].leaving).toBeFalsy();
            expect(assignment.latestAttempters[1].leaving).toBeTruthy();
        })
    })


    describe("addStudentToLatestAttemptersWithLocation", function() {

        it("adds student to latestAttempters of assignment and attaches it given position as location", function() {
            assignment.latestAttempters = [{"id": 15}, {"id": 13}];
            student.id = 22;
            student.lastDoneAssignment = {"number": 1, "timestamp": 8};
            var location = {'x': 100, 'y': 125};

            service.addStudentToLatestAttemptersWithLocation(student, assignment, location);

            expect(assignment.latestAttempters.length).toBe(3)
            expect(assignment.latestAttempters[2].id).toBe(22)
            expect(assignment.latestAttempters[2].location).toEqual(location);
        })
    })


    describe("removeStudentFromLatestAttemptersOfAssignmentFromPosition", function() {

        beforeEach(function() {
            assignment.location = {'x': 150, 'y': 325};
            var x = assignment.location.x;
            var y = assignment.location.y;

            assignment.latestAttempters = [{"id": 20,  "lastDoneAssignment": {"number": 1, "timestamp": 9}, "location": {'x': x + 50 + 0.000000002, 'y': y}},
                                      {"id": 22,  "lastDoneAssignment": {"number": 1, "timestamp": 10}, "location": {'x': x + 80, 'y': y}, "dummy": true},
                                      {"id": 24,  "lastDoneAssignment": {"number": 1, "timestamp": 7}, "location": {'x': x + 50, 'y': y + 30}},
                                      {"id": 23,  "lastDoneAssignment": {"number": 1, "timestamp": 13}, "location": {'x': x + 80, 'y': y + 30}, "dummy": true},
                                      {"id": 21,  "lastDoneAssignment": {"number": 1, "timestamp": 14}, "location": {'x': x + 110, 'y': y }} ];
        
            expect(assignment.latestAttempters.length).toBe(5)
        })       

        it("removes doer from latestAttempters of assignment with given position if 'locationsAreTheSame' returns true", function() {
            expect(service.studentIsInLatestAttemptersOfAssignment({"id": 20}, assignment)).toBeTruthy();

            service.removeStudentFromLatestAttemptersOfAssignmentFromPosition(assignment, {'x': assignment.location.x + 50, 'y': assignment.location.y});
            
            expect(service.studentIsInLatestAttemptersOfAssignment({"id": 20}, assignment)).toBeFalsy();
            expect(assignment.latestAttempters.length).toBe(4)
        })

        
        it("keeps assignment's latestAttempters the same if location doesn't match with any doer", function() {
            var returnVal = service.removeStudentFromLatestAttemptersOfAssignmentFromPosition(assignment, {'x': assignment.location.x + 110, 'y': assignment.location.y + 30});

            expect(returnVal).toBeFalsy();
            expect(assignment.latestAttempters.length).toBe(5)
        })

        it("if finds and removes a doer, returns information behind, whether the removed doer was a real (truthy) or dummy (falsy) student", function() {
            expect(service.studentIsInLatestAttemptersOfAssignment({"id": 20}, assignment)).toBeTruthy();
            var real_doer = service.removeStudentFromLatestAttemptersOfAssignmentFromPosition(assignment, {'x': assignment.location.x + 50, 'y': assignment.location.y});
            
            expect(service.studentIsInLatestAttemptersOfAssignment({"id": 20}, assignment)).toBeFalsy();
            expect(real_doer).toBeTruthy();

            expect(service.studentIsInLatestAttemptersOfAssignment({"id": 22}, assignment)).toBeTruthy();
            real_doer = service.removeStudentFromLatestAttemptersOfAssignmentFromPosition(assignment, {'x': assignment.location.x + 80, 'y': assignment.location.y});

            expect(service.studentIsInLatestAttemptersOfAssignment({"id": 22}, assignment)).toBeFalsy();
            expect(real_doer).toBeFalsy();

            expect(assignment.latestAttempters.length).toBe(3)
        })
    })


    describe('removeStudentFromLatestAttemptersOfAssignment', function() {

        it("removes a doer that corresponds to student given as a parameter and returns it", function() {
            assignment.latestAttempters = [{"id": 15, "lastDoneAssignment": {"number": 1, "timestamp": 9}},
                                      {"id": 13, "lastDoneAssignment": {"number": 3, "timestamp": 17}},
                                      {"id": 16, "lastDoneAssignment": {"number": 4, "timestamp": 13}} ];

            expect(service.studentIsInLatestAttemptersOfAssignment({"id": 13}, assignment)).toBeTruthy();

            var doer = service.removeStudentFromLatestAttemptersOfAssignment({"id": 13}, assignment);

            expect(doer.id).toBe(13);
            expect(doer.lastDoneAssignment.timestamp).toBe(17)

            expect(service.studentIsInLatestAttemptersOfAssignment({"id": 13}, assignment)).toBeFalsy();
            expect(assignment.latestAttempters.length).toBe(2)
        })
    })

    /*
        Tila jolloin kutsutaan on sellainen että tehtävältä on poistettu juuri tekijä, joten latestDoereja 0-4 kpl.
        Etsii uusimman tekijän studentien listasta, joka on tehtävän viimeksi tehnyt ja palauttaa sen.
    */

    describe("studentToAddInPlaceOfRemovedOne", function() {

        beforeEach(function() {
            assignment.number = 2;
            assignment.latestAttempters = [{"id": 15, "lastDoneAssignment": {"number": 2, "timestamp": 9}},
                                      {"id": 13, "lastDoneAssignment": {"number": 2, "timestamp": 17}},
                                      {"id": 16, "lastDoneAssignment": {"number": 2, "timestamp": 13}} ];

            expect(assignment.number).toBe(2);
        })

        it("returns a falsy value if no student has assignment nro. 2 as its originalAssignment and lastDoneAssignment", function() {
            var idNrTs = [[7, 3, 1], [12, 4, 5], [19, 1, 16], [10, 62, 55]];

            for (var i = 0; i < idNrTs.length; i++) {
                var doer = {"id": idNrTs[i][0], "lastDoneAssignment": {"number": idNrTs[i][1], "timestamp": idNrTs[i][2]}};
                doer.originalAssignment = doer.lastDoneAssignment;

                students.push(doer);
            }
            students.push({"id": 16});

            var studentToAdd = service.studentToAddInPlaceOfRemovedOne(assignment, students);
            expect(studentToAdd).toBeFalsy();
        })


        it("if one student has assignment nro. 2 as its originalAssignment and lastDoneAssignment, returns that", function() {
            var idNrTs = [[7, 3, 1], [12, 4, 5], [19, 2, 16], [10, 62, 55]];

            for (var i = 0; i < idNrTs.length; i++) {
                var doer = {"id": idNrTs[i][0], "lastDoneAssignment": {"number": idNrTs[i][1], "timestamp": idNrTs[i][2]}};
                doer.originalAssignment = doer.lastDoneAssignment;

                students.push(doer);
            }

            var studentToAdd = service.studentToAddInPlaceOfRemovedOne(assignment, students);

            expect(studentToAdd.id).toBe(19);
            expect(studentToAdd.lastDoneAssignment.number).toBe(2);
            expect(studentToAdd.lastDoneAssignment.timestamp).toBe(16);
        })

        it("if several students have assignment nro. 2 as their originalAssignment and lastDoneAssignment, returns the one who has done it last", function() {
            var idNrTs = [[7, 3, 1], [12, 4, 5], [19, 2, 16], [10, 62, 55], [21, 2, 33], [22, 4, 66], [35, 2, 32]];

            for (var i = 0; i < idNrTs.length; i++) {
                var doer = {"id": idNrTs[i][0], "lastDoneAssignment": {"number": idNrTs[i][1], "timestamp": idNrTs[i][2]}};
                doer.originalAssignment = doer.lastDoneAssignment;

                students.push(doer);
            }
            students.push({"id": 16});
            students.push({"id": 1});

            var studentToAdd = service.studentToAddInPlaceOfRemovedOne(assignment, students);

            expect(studentToAdd.id).toBe(21);
            expect(studentToAdd.lastDoneAssignment.number).toBe(2);
            expect(studentToAdd.lastDoneAssignment.timestamp).toBe(33);
        })
    })


    describe("getLocationOfStudent", function() {

        it("returns location of a doer that corresponds to the asked student", function() {
            var x = 637;
            var y = 1966;

            assignment.latestAttempters = [{"id": 20,  "lastDoneAssignment": {"number": 1, "timestamp": 9}, "location": {'x': x + 50 + 0.000000002, 'y': y}},
                                      {"id": 22,  "lastDoneAssignment": {"number": 1, "timestamp": 10}, "location": {'x': x + 80, 'y': y}, "dummy": true},
                                      {"id": 24,  "lastDoneAssignment": {"number": 1, "timestamp": 7}, "location": {'x': x + 50, 'y': y + 30}} ];
        
            expect(service.getLocationOfStudent({"id": 24}, assignment)).toEqual({'x': 637 + 50, 'y': 1966 + 30});
        })

    })


    describe("nextPositionToMoveToAroundAssignment", function() {

        beforeEach(function() {
            assignment.id = 6503;
            assignment.number = 18;
            assignment.location = {'x': 327, 'y': 451};
            assignment.latestAttempters = [];

            student.id = 35;
            student.lastDoneAssignment = {"number": 42, "timestamp": 22};
        })

        describe("when assignment has less than 9 latestAttempters", function() {

            beforeEach(function() {
                var x = assignment.location.x;
                var y = assignment.location.y;

                // 3. ja 5. positio ovat alussa vapaat.

                assignment.latestAttempters = [{"id": 22,  "lastDoneAssignment": {"number": 18, "timestamp": 10}, "location": {'x': x + 50, 'y': y}},
                                          {"id": 24,  "lastDoneAssignment": {"number": 18, "timestamp": 7}, "location": {'x': x + 80, 'y': y}},
                                          {"id": 23,  "lastDoneAssignment": {"number": 18, "timestamp": 13}, "location": {'x': x + 50, 'y': y + 30}} ];                
                
                expect(assignment.latestAttempters.length).toBe(3);
                student.id = 73;
            })

            describe("and no one is leaving", function() {

                beforeEach(function() {
                    for (var i = 0; i < assignment.latestAttempters.length; i++) {
                        assignment.latestAttempters[i].leaving = false;
                    }
                })

                it("returns the first free position which no doer has taken, and places a dummy, reserved doer with that position in latestAttempters of assignment", function() {
                    var position = service.nextPositionToMoveToAroundAssignment(student, assignment);
                    expect(position).toEqual({'x': assignment.location.x + 110, 'y': assignment.location.y});
                    
                    expect(assignment.latestAttempters.length).toBe(4);
                    
                    var doer = assignment.latestAttempters[3];
                    
                    expect(doer.dummy).toBeTruthy();
                    expect(doer.reserved).toBeTruthy();
                    expect(doer.location).toEqual(position);

                    var student2 = {'id': 75, 'lastDoneAssignment': {'number': 33, 'timestamp': 2}};

                    position = service.nextPositionToMoveToAroundAssignment(student2, assignment);
                    expect(position).toEqual({'x': assignment.location.x + 80, 'y': assignment.location.y + 30});

                    expect(assignment.latestAttempters.length).toBe(5);

                    doer = assignment.latestAttempters[4];

                    expect(doer.dummy).toBeTruthy();
                    expect(doer.reserved).toBeTruthy();
                    expect(doer.location).toEqual(position);                    
                })
            })

            describe("and some doers are leaving", function() {

                beforeEach(function() {
                    for (var i = 0; i < assignment.latestAttempters.length; i++) {
                        assignment.latestAttempters[i].leaving = [true, true, false][i]; // doers in positions 1. and 2. leave
                        assignment.latestAttempters[i].reserved = [true, false, true][i]; // only doer in position 2 is not reserved
                    }
                })

                it("returns the first free position, and when a doer has taken that, sets the reserved flag of that doer to true", function() {
                    var position = service.nextPositionToMoveToAroundAssignment(undefined, assignment);
                    expect(position).toEqual({'x': assignment.location.x + 80, 'y': assignment.location.y});

                    expect(assignment.latestAttempters.length).toBe(3);

                    var doer = assignment.latestAttempters[1];

                    expect(doer.reserved).toBeTruthy();
                    expect(doer.leaving).toBeTruthy();
                    expect(doer.dummy).toBeFalsy();
                    expect(doer.location).toEqual(position);
                })
            })
        })


        describe("when assignment has 9 latestAttempters", function() {

            beforeEach(function() {
                var x = assignment.location.x;
                var y = assignment.location.y;

                assignment.latestAttempters = [{"id": 20,  "lastDoneAssignment": {"number": 18, "timestamp": 9}, "location": {'x': x + 50 + 0.000000002, 'y': y}},
                                          {"id": 22,  "lastDoneAssignment": {"number": 18, "timestamp": 10}, "location": {'x': x + 80, 'y': y}},
                                          {"id": 24,  "lastDoneAssignment": {"number": 18, "timestamp": 7}, "location": {'x': x + 50, 'y': y + 30}},
                                          {"id": 23,  "lastDoneAssignment": {"number": 18, "timestamp": 13}, "location": {'x': x + 80, 'y': y + 30}},
                                          {"id": 21,  "lastDoneAssignment": {"number": 18, "timestamp": 14}, "location": {'x': x + 110, 'y': y + 60}},
                                          {"id": 27,  "lastDoneAssignment": {"number": 18, "timestamp": 18}, "location": {'x': x + 110, 'y': y }},
                                          {"id": 31,  "lastDoneAssignment": {"number": 18, "timestamp": 19}, "location": {'x': x + 110, 'y': y + 30}},
                                          {"id": 36,  "lastDoneAssignment": {"number": 18, "timestamp": 23}, "location": {'x': x + 80, 'y': y + 60}},
                                          {"id": 55,  "lastDoneAssignment": {"number": 18, "timestamp": 25}, "location": {'x': x + 50, 'y': y + 60}} ];                
            })

            describe("and no one is leaving", function() {

                beforeEach(function() {
                    for (var i = 0; i < assignment.latestAttempters.length; i++) {
                        assignment.latestAttempters[i].leaving = false;
                    }
                })

                describe("and no position is reserved", function() {

                    beforeEach(function() {
                        for (var i = 0; i < assignment.latestAttempters.length; i++) {
                            assignment.latestAttempters[i].reserved = false;
                        }
                    })

                    it("returns the position, and sets the reserved flag of the oldest doer in latestAttempters of assignment", function() {
                        expect(assignment.latestAttempters[2].reserved).toBeFalsy();

                        var position = service.nextPositionToMoveToAroundAssignment(undefined, assignment);
                        expect(position).toEqual(assignment.latestAttempters[2].location);

                        expect(assignment.latestAttempters[2].reserved).toBeTruthy();
                    })
                })

                describe("and some, but not all positions are reserved", function() {
                    
                    beforeEach(function() {
                        for (var i = 0; i < assignment.latestAttempters.length; i++) {
                            assignment.latestAttempters[i].reserved = [true, false, true, true, false][i];
                        }
                    })

                    it("returns the position, and sets the reserved flag of the oldest doer which is not reserved in latestAttempters of assignment", function() {
                        expect(assignment.latestAttempters[1].reserved).toBeFalsy();

                        var position = service.nextPositionToMoveToAroundAssignment(undefined, assignment);
                        expect(position).toEqual(assignment.latestAttempters[1].location);

                        expect(assignment.latestAttempters[1].reserved).toBeTruthy();
                    })              
                })

                describe("and all positions are reserved", function() {
                    
                    beforeEach(function() {
                        for (var i = 0; i < assignment.latestAttempters.length; i++) {
                            assignment.latestAttempters[i].reserved = true;
                        }
                    })

                    it("sets all doers as not reserved, returns the position, and sets the reserved flag of the oldest doer in latestAttempters of assignment", function() {
                        expect(assignment.latestAttempters[2].reserved).toBeTruthy();

                        var position = service.nextPositionToMoveToAroundAssignment(undefined, assignment);
                        expect(position).toEqual(assignment.latestAttempters[2].location);

                        for (var i = 0; i < assignment.latestAttempters.length; i++) {
                            if (i != 2) {
                                expect(assignment.latestAttempters[i].reserved).toBeFalsy();
                            }
                            else {
                                expect(assignment.latestAttempters[i].reserved).toBeTruthy();
                            }
                        }
                    })
                })
            })

            describe("and some doers are leaving", function() {

                beforeEach(function() {
                    for (var i = 0; i < assignment.latestAttempters.length; i++) {
                        assignment.latestAttempters[i].leaving = [true, false, true, false, false][i];
                    }
                })

                describe("but leaving doers have reserved flags set to true", function() {
                    
                    beforeEach(function() {
                        for (var i = 0; i < assignment.latestAttempters.length; i++) {
                            assignment.latestAttempters[i].reserved = [true, true, true, false, false][i];
                        }
                    })

                    it("returns the position, and sets the reserved flag of the oldest doer which is not reserved in latestAttempters of assignment", function() {
                        expect(assignment.latestAttempters[3].reserved).toBeFalsy();

                        var position = service.nextPositionToMoveToAroundAssignment(undefined, assignment);
                        expect(position).toEqual(assignment.latestAttempters[3].location);

                        expect(assignment.latestAttempters[3].reserved).toBeTruthy();
                    })
                })

                describe("and one doer who leaves has its reserved flag set to a falsy value", function() {

                    beforeEach(function() {
                        for (var i = 0; i < assignment.latestAttempters.length; i++) {
                            assignment.latestAttempters[i].reserved = [false, true, true, false, false][i];
                        }
                    })

                    it("returns the position of that doer and sets the reserved flag of that to true", function() {
                        expect(assignment.latestAttempters[0].reserved).toBeFalsy();

                        var position = service.nextPositionToMoveToAroundAssignment(undefined, assignment);
                        expect(position.x).toBe(Math.round(assignment.latestAttempters[0].location.x));
                        expect(position.y).toBe(assignment.latestAttempters[0].location.y);

                        expect(assignment.latestAttempters[0].reserved).toBeTruthy();
                    })
                })
            })
        })
    })
})