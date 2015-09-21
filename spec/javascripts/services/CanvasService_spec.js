describe('CanvasService', function () {
    var service;

    beforeEach(function () {
        module('ProgressApp');

        inject(function (_CanvasService_) {
            service = _CanvasService_
        });

    });


    it('initiateCanvas returns a canvas', function () {
        var canvas = service.initiateCanvas(100, 200, "", "rgba(30, 85, 205, 0.50")

        expect(canvas.width).toBe(200)
        expect(canvas.height).toBe(100)
    })

    // muokkaa canvasservicen "placeInDiv metodia myöhemmin"
})