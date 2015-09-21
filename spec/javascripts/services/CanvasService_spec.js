describe('CanvasService', function () {
    var service, canvas;

    beforeEach(function () {
        module('ProgressApp');

        inject(function (_CanvasService_) {
            service = _CanvasService_
        });

        canvas = service.initiateCanvas(100, 200, "", "rgba(30, 85, 205, 0.50");
    });


    describe('initiateCanvas', function() {

        it('returns an object', function () {
            expect(angular.isObject(canvas)).toBe(true)
        })

        it('sets its width and height to the values given as parameters', function () {
            expect(canvas.width).toBe(200)
            expect(canvas.height).toBe(100)
        })
    })


    it('drawSmoothPaths modifies the context of canvas', function () {
        var locations = [ [100, 250], [330, 180], [500, 130] ];
        service.drawSmoothPaths(locations);

        var context = service.getContext();

        expect(context.lineWidth > 0).toBe(true);
        expect(context.lineJoin).toBe('round');
        expect(context.lineCap).toBe('round');
    })
})