ProgressApp.service('AssignmentCirclesService', function (MapScaleService) {

    this.initializeCircle = function (assignment, students, assignmentLayer, percentageLayer, labelLayer) {
        var location = assignment.location;
        var percentageCompleted = assignment.doers.length / students.length * 100;

        var circle = new paper.Path.Circle(location, 35);
        assignmentLayer.addChild(circle);

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
        labelLayer.addChild(text);

        //percentage over assignment circles
        var percentageLocationPoint = {'x': location.x, 'y': location.y + 30};

        var percentage = new paper.PointText({
            point: percentageLocationPoint,
            content: Math.floor(percentageCompleted) + "%",
            fillColor: 'black',
            justification: 'center'
        });
        percentageLayer.addChild(percentage);
        paper.view.update();
    }


    this.updateCircleAfterNewDoer = function (assignment, students, assignmentLayer, percentageLayer) {
        var circle = assignmentLayer.children[assignment.number - 1];
        var percentageCompleted = assignment.doers.length / students.length * 100;

        //circle.fillColor = 'yellow';

        if (Math.floor(percentageCompleted) <= 100) {
            percentageLayer.children[assignment.number - 1].content = Math.floor(percentageCompleted) + "%";

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
            }
        }
        paper.view.update();
    }
})
