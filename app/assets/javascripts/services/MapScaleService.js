ProgressApp.service('MapScaleService', function () {
    var previousWindowWidth = 1100;

    function getRelativeX(x) {
        return (x / previousWindowWidth) * window.innerWidth;
    }

//the x-position of something in the current window width, with the default width of 1100
    function getRelativeXFromDefaultSize(x) {
        return (x / 1100) * window.innerWidth;
    }

    this.setPreviousWidth = function(width) {
        previousWindowWidth = width;
    }
})