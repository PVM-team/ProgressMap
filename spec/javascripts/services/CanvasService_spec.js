describe('CanvasService', function () {
    var service;
    var canvas;
    var assignments = []
    var locations = [];

    beforeEach(function () {
        module('ProgressApp');

        inject(function (_CanvasService_) {
            service = _CanvasService_
        });

        canvas = service.initiateCanvas(100, 200, "", "rgba(30, 85, 205, 0.50");
        assignments =
            [{"id": 1, "location": {"id": 1, "x": 100, "y": 250}, "doers": [{"id": 2}, {"id": 1}]},
                {"id": 2, "location": {"id": 2, "x": 330, "y": 180}, "doers": [{"id" : 1}]},
                {"id": 3, "location": {"id": 3, "x": 500, "y": 130}, "doers": [{"id": 1}]}];
        for (var i = 0; i < assignments.length; i++) {
            locations.push([assignments[i].location.x, assignments[i].location.y]);
        }

    });


    it('initiateCanvas returns a canvas', function () {
        expect(canvas.width).toBe(200)
        expect(canvas.height).toBe(100)
    })

    // muokkaa canvasservicen "placeInDiv metodia myöhemmin"

    it('drawSmoothPaths modifies the context of canvas', function () {
        service.drawSmoothPaths(locations);
        var context = service.getContext();

        expect(context.lineWidth).toBe(2);
        expect(context.lineJoin).toBe('round');
        expect(context.lineCap).toBe('round');
    })
})