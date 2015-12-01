ProgressApp.service('MapScaleService', function () {
	var previousWindowWidth = 1100;
	var defaultWindowWidth = 1100;

    //the x-position of something in the current window width relative to the previous window width
    this.getRelativeX = function(x) {
        return (x / previousWindowWidth) * window.innerWidth;
    }

    //the x-position of something in the current window width, relative to the default width of 1100
    this.getRelativeXFromDefaultSize = function(x) {
        return (x / defaultWindowWidth) * window.innerWidth;
    }

    this.setPreviousWindowWidth = function(windowWidth) {
    	previousWindowWidth = windowWidth;
    }

    this.getPreviousWindowWidth = function() {
    	return previousWindowWidth;
    }

    this.getScale = function() {
        return window.innerWidth / previousWindowWidth;
    }

    this.scaleToDefault = function() {
        return window.innerWidth / defaultWindowWidth;
    }
})