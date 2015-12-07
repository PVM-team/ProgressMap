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

    this.scaleItemsByWidth = function(layer) {
        var items = layer.children;
        for (var i = 0; i < items.length; i++) {
            items[i].position.x = this.getRelativeX(items[i].position.x);
            items[i].scale(window.innerWidth / previousWindowWidth);
        }
    }

    this.scalePath = function(pathLayer){
        var path = pathLayer.firstChild;
        var segments = path.segments;

        for (var i = 0; i < segments.length; i++) {
            segments[i].point.x = this.getRelativeX(segments[i].point.x);
        }
        path.strokeWidth = (path.strokeWidth / previousWindowWidth) * window.innerWidth;
    }
})