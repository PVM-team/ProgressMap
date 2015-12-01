ProgressApp.service('AssignmentCirclesService', function (MapScaleService) {

    this.createAssignmentCircle = function(assLayer, textLayer, location, index){
        assLayer.activate();
        var assignmentCircle = new paper.Path.Circle(location, 35);
        createAssignmentNumber(index, location, textLayer);
        return assignmentCircle;
    }

    this.setStudentAssignmentCircleStyle = function(assignmentCircle) {
        setBaseStyle(assignmentCircle);
        assignmentCircle.fillColor = '#f18c3a';
    }

    function setBaseStyle(assignmentCircle){
        assignmentCircle.style = {
            shadowColor: 'black',
            shadowBlur: 12,
            shadowOffset: [5, 5]
        }
        assignmentCircle.opacity = 0.8;
    }

    function createAssignmentNumber(index, location, textLayer) {
        textLayer.activate();
        var text = new paper.PointText({
            point: [location.x, location.y+6],
            content: index + 1,
            fillColor: 'black',
            fontSize: 20,
            justification: 'center'
        });
    }

    this.createActionMapAssignment = function (assignment, students, assignmentLayer, percentageLayer, labelLayer) {
        var location = assignment.location;

        var percentageCompleted = calculateCompletionPercentage(assignment.doers.length, students.length);

        var circle = this.createAssignmentCircle(assignmentLayer, labelLayer, location, assignment.number-1);
        setActionMapAssignmentStyle(circle, percentageCompleted);
        var percentageLocation = {'x': location.x, 'y': location.y + 30};
        createPercentageNumber(percentageLocation, percentageCompleted, percentageLayer);
        paper.view.update();
    }


    function setActionMapAssignmentStyle(circle, percentageCompleted){
        setBaseStyle(circle);
        circle.style = {
            fillColor: {
                gradient: {
                    stops: [['#ffca6a',0.1], ['#ffb93a', 0.4], ['#a96d00', 1]],
                    radial: true
                },
                origin: circle.position,
                destination: circle.bounds.rightCenter
            }
        }
        var color = circle.fillColor;

        for(var i = 0; i < color.gradient.stops.length; i++) {
            color.gradient.stops[i].color.hue += (percentageCompleted * 0.6) ;
        }
    }

    function createPercentageNumber(location, percentage, layer){
        layer.activate();
        var percentage = new paper.PointText({
            point: location,
            content: Math.floor(percentage) + "%",
            fillColor: 'black',
            justification: 'center'
        });
    }


    this.updateCircleAfterNewDoer = function (assignment, students, assignmentLayer, percentageLayer) {
        var circle = assignmentLayer.children[assignment.number - 1];
        var percentageCompleted = calculateCompletionPercentage(assignment.doers.length, students.length);

        if (Math.floor(percentageCompleted) <= 100) {
            percentageLayer.children[assignment.number - 1].content = Math.floor(percentageCompleted) + "%";

            setActionMapAssignmentStyle(circle, percentageCompleted);
        }
        paper.view.update();
    }

    function calculateCompletionPercentage(doersAmount, studentsAmount){
        var percentageCompleted = doersAmount / studentsAmount * 100;
        if (isNaN(percentageCompleted)){
            percentageCompleted = 0;
        }
        return percentageCompleted;
    }
})
