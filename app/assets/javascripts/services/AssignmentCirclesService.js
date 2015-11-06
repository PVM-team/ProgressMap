ProgressApp.service('AssignmentCirclesService', function () {

	this.drawCircle = function(assignment, students) {
		var location = assignment.location;
		var percentageCompleted = assignment.doers.length / students.length * 100;

        var circle = new paper.Path.Circle(location, 35);

        circle.style = {
            fillColor: {
                    gradient: {
                        stops: [['#ffca6a',0.1], ['#ffb93a', 0.4], ['#a96d00', 1]],
                        radial: true
                    },
                    origin: circle.position,
                    destination: circle.bounds.rightCenter
            },
            shadowColor: 'black',
            shadowBlur: 12,
            shadowOffset: [5,5]
        }
        var color = circle.fillColor;
             

        for(var i = 0; i < color.gradient.stops.length; i++) {

            color.gradient.stops[i].color.hue += (percentageCompleted * 0.6) ;
            //color.gradient.stops[i].color.saturation = 1 - (percentageCompleted * 0.005)
            //color.gradient.stops[i].color.brightness = 0.5 + (percentageCompleted * 0.001) * 5
            //color.gradient.stops[i].color.lightness = 0.5 + (percentageCompleted * 0.001) * 5
        }

        circle.opacity = 0.8;
        //assignment numbers over assignment circles
        var text = new paper.PointText({
            point: [location.x, location.y+6],
            content: assignment.number,
            fillColor: 'black',
            fontSize: 20,
            justification: 'center'
        });

        //percentage over assignment circles
        var percentageLocationPoint = {'x': location.x, 'y': location.y + 30};

        var percentage = new paper.PointText({
            point: percentageLocationPoint,
            content: Math.floor(percentageCompleted) + "%",
            fillColor: 'black',
            justification: 'center'
        });
        paper.view.update();
    }
})
