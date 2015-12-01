ProgressApp.service('MoveStudentIconService', function (MapScaleService) {

	this.hasReachedDestination = function(icon, destination) {
        return distanceToDestination(icon, destination) < MapScaleService.getRelativeXFromDefaultSize(1);
    }

    /*
        Jos huomaat että liikkuessa toisen opiskelijan päälle, oma circle katoaa, lisää vertailuarvoa (tällä hetkellä '30') suuremmaksi.
    */

    this.approachingDestination = function(icon, destination) {
        return distanceToDestination(icon, destination) < MapScaleService.getRelativeXFromDefaultSize(30);
    }

    function distanceToDestination(icon, destination) {
        var vector = getVector(icon, destination);
        return Math.abs(vector[0]) + Math.abs(vector[1]);
    }

    function getVector(icon, destination) {
        var position = icon.position;
        return [destination.x - position.x, destination.y - position.y];
    }

    /*
        Liikuttaa circleä eteenpäin. Liikkumisen määrä riippuu circlen nopeudesta ko. ajanhetkellä sekä
        matkasta perille (vector).

        Laskee lopuksi uuden nopeuden circlelle ja palauttaa sen.
    */

    this.moveIcon = function(icon, startPosition, endPosition, speed, minSpeed) {
        var vector = getVector(icon, endPosition);
        var totalDistance = distance(startPosition, endPosition);
        var distanceRemaining = distance(icon.position, endPosition);

        icon.position.x += vector[0] / speed;
        icon.position.y += vector[1] / speed;

        paper.view.update();

        if (distanceRemaining * 7 > totalDistance) {   // etäisyys yli 1/7 kokonaismatkasta kohteeseen
            speed -= 0.5;                              // nopeus kasvaa "smoothisti"
        }

        else if (distanceRemaining * 20 > totalDistance) { // nopeus alkaa laskemaan "smoothisti"
            speed += 0.1
        }
        else {
            speed += 0.02 // speed laskee vain vähän kun ollaan alle 5% etäisyydellä kohteeseen
        }

        speed = Math.max(10, speed);                   // nopeus tulee olla 10+ ja 100-
        return Math.min(speed, minSpeed);
    }

    function distance(point1, point2) {
    	return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    }
})