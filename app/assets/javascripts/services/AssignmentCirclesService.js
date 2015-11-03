ProgressApp.service('AssignmentCirclesService', function () {

	this.drawCircle = function(assignment, students) {
		var location = assignment.location;
		var percentageCompleted = assignment.doers.length / students.length * 100;

        var circle = new paper.Path.Circle(location, 25);
        
        circle.fillColor = 'yellow';
        circle.fillColor.hue += percentageCompleted;

        //assignment numbers over assignment circles
        var text = new paper.PointText({
                   		point: location,
                        content: assignment.number,
                        fillColor: 'white'
        });

        //percentage over assignment circles
        var percentageLocationPoint = {'x': location.x, 'y': location.y + 20};

        var percentage = new paper.PointText({
                        point: percentageLocationPoint,
                        content: Math.floor(percentageCompleted) + "%",
                        fillColor: 'white'
        });
        paper.view.update();
	}
})