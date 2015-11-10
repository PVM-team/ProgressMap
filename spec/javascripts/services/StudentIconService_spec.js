describe('StudentIconService', function () {
    var service;
    var students;

    beforeEach(function () {
        module('ProgressApp');

        students = [{"id": 1,  "lastDoneAssignment": null, location: {},  reserved: false, leaving: false, dummy: false},
            {"id": 2,  "lastDoneAssignment": {"number": 1, "timestamp": 9}, location: {"x": 3, "y":3}, reserved: false, leaving: false, dummy: false},
            {"id": 3,  "lastDoneAssignment": {"number": 1, "timestamp": 8}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 4,  "lastDoneAssignment": {"number": 1, "timestamp": 7}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 5,  "lastDoneAssignment": {"number": 1, "timestamp": 6}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 6,  "lastDoneAssignment": {"number": 2, "timestamp": 5}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 7,  "lastDoneAssignment": {"number": 2, "timestamp": 6}, location: {"x": 1, "y":1}, reserved: false, leaving: false, dummy: false},
            {"id": 8,  "lastDoneAssignment": {"number": 1, "timestamp": 5}, location: {x: 146.5909090909091, y: 250}, reserved: false, leaving: false, dummy: false},
            {"id": 9,  "lastDoneAssignment": {"number": 3, "timestamp": 8}, location: {x: 546.5909090909091, y: 130}, reserved: false, leaving: false, dummy: false},];


        inject(function (_StudentIconService_) {
            service = _StudentIconService_;
        });
    });

    describe('colorOfCircleOfStudent', function() {
        it('should return right color', function() {
            expect(service.colorOfCircleOfStudent(students[0])).toEqual('#374d37');
            expect(service.colorOfCircleOfStudent(students[1])).toEqual('#373763');
            expect(service.colorOfCircleOfStudent(students[2])).toEqual('#7a3737');
        })
    })
})
