ProgressApp.service('AssignmentCirclesService', function (MapScaleService) {

    this.initializeCircle = function (assignment, students, assignmentLayer, percentageLayer, labelLayer) {
        var location = assignment.location;
        var percentageCompleted = assignment.doers.length / students.length * 100;

        var circle = new paper.Path.Circle(location, 35);

        circle.fillColor = 'yellow';
        circle.fillColor.hue += percentageCompleted;

        assignmentLayer.addChild(circle);

        //assignment numbers over assignment circles
        var text = new paper.PointText({
            point: location,
            content: assignment.number,
            fillColor: 'black',
            fontSize: 20
        });
        labelLayer.addChild(text);

        //percentage over assignment circles
        var percentageLocationPoint = {'x': location.x, 'y': location.y + 20};

        var percentage = new paper.PointText({
            point: percentageLocationPoint,
            content: Math.floor(percentageCompleted) + "%",
            fillColor: 'black'
        });
        percentageLayer.addChild(percentage);
        paper.view.update();
    }


    this.updateCircleAfterNewDoer = function (assignment, students, assignmentLayer, percentageLayer) {
        var circle = assignmentLayer.children[assignment.number - 1];
        var percentageCompleted = assignment.doers.length / students.length * 100;

        circle.fillColor = 'yellow';
        circle.fillColor.hue += percentageCompleted;

        if (Math.floor(percentageCompleted) <= 100) {
            percentageLayer.children[assignment.number - 1].content = Math.floor(percentageCompleted) + "%";
        }
        paper.view.update();
    }
})