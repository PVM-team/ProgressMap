describe('CanvasService', function () {
    var service, canvas;

    beforeEach(function () {
        module('ProgressApp');

        inject(function (_CanvasService_) {
            service = _CanvasService_
        });

        canvas = service.initiateCanvas(25, 1000, "", "rgba(30, 85, 205, 0.50");
    });


    describe('initiateCanvas', function() {

        it('returns an object', function () {
            expect(angular.isObject(canvas)).toBe(true)
        })

        it('sets its width and height to the values given as parameters', function () {
            var expectedWidth = 1000 + 100;
            var expectedHeight = 7 * 250 + 100;

            expect(canvas.width).toBe(expectedWidth);
            expect(canvas.height).toBe(expectedHeight)
        })
    })

    it('drawSmoothPaths modifies the context of canvas', function () {
        var assignments = [{'location': {'x': 100, 'y': 250}},
                           {'location': {'x': 330, 'y': 180}},
                           {'location': {'x': 500, 'y': 130}}];

        service.drawSmoothPaths(assignments);

        var context = service.getContext();

        expect(context.lineWidth > 0).toBe(true);
        expect(context.lineJoin).toBe('round');
        expect(context.lineCap).toBe('round');
    })
})