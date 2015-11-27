ProgressApp.service('MapScaleService', function () {
	var previousWindowWidth = 1100;
	var defaultWindowWidth = 1100;

    this.getRelativeX = function(x) {
        return (x / previousWindowWidth) * window.innerWidth;
    }

    this.setPreviousWindowWidth = function(windowWidth) {
    	previousWindowWidth = windowWidth;
    }

    this.getPreviousWindowWidth = function() {
    	return previousWindowWidth;
    }

    this.scaleByDefaultWidth = function(x) {
        return (x / defaultWindowWidth) * window.innerWidth;
    }
})