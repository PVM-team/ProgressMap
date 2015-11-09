ProgressApp.service('MoveStudentCircleService', function (MapScaleService) {

	this.hasReachedDestination = function(circle, destination) {
        return distanceToDestination(circle, destination) < MapScaleService.scaleByDefaultWidth(1);
    }

    /*
        Jos huomaat että liikkuessa toisen opiskelijan päälle, oma circle katoaa, lisää vertailuarvoa (tällä hetkellä '30') suuremmaksi.
    */

    this.approachingDestination = function(circle, destination) {
        return distanceToDestination(circle, destination) < MapScaleService.scaleByDefaultWidth(30);
    }

    function distanceToDestination(circle, destination) {
        var vector = getVector(circle, destination);
        return Math.abs(vector[0]) + Math.abs(vector[1]);
    }

    function getVector(circle, destination) {
        var position = circle.position;
        return [destination.x - position.x, destination.y - position.y];
    }

    /*
        Liikuttaa circleä eteenpäin. Liikkumisen määrä riippuu circlen nopeudesta ko. ajanhetkellä sekä
        matkasta perille (vector).

        Laskee lopuksi uuden nopeuden circlelle ja palauttaa sen.
    */

    this.moveCircle = function(circle, startPosition, endPosition, speed, minSpeed) {
        var vector = getVector(circle, endPosition);
        var totalDistance = distance(startPosition, endPosition);
        var distanceRemaining = distance(circle.position, endPosition);

        circle.position.x += vector[0] / speed;
        circle.position.y += vector[1] / speed;

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