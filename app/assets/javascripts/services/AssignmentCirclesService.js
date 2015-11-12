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

    /*this.drawCircle = function(assignment, students) {
     var location = assignment.location;
     var percentageCompleted = assignment.doers.length / students.length * 100;

     var circle = new paper.Path.Circle(location, MapScaleService.getRelativeX(35));
     circle.scale(window.innerWidth / MapScaleService.getPreviousWindowWidth());

     circle.fillColor = 'yellow';
     circle.fillColor.hue += percentageCompleted;

     //assignment numbers over assignment circles
     var text = new paper.PointText({
     point: location,
     content: assignment.number,
     fillColor: 'white',
     fontSize: MapScaleService.getRelativeX(20)
     });

     //percentage over assignment circles
     var percentageLocationPoint = {'x': location.x, 'y': location.y + MapScaleService.getRelativeX(20) };

     var percentage = new paper.PointText({
     point: percentageLocationPoint,
     content: Math.floor(percentageCompleted) + "%",
     fillColor: 'white'
     });
     paper.view.update();
     } */

    this.updateCircleAfterNewDoer = function (assignment, students, assignmentLayer, percentageLayer) {
        //var location = assignment.location;

        //var hitTest = assignmentLayer.hitTest(location);

        /*if (!hitTest) {
         console.log("circle not found. couldn't update.")
         return;
         }*/

        var circle = assignmentLayer.children[assignment.number - 1];
        var percentageCompleted = assignment.doers.length / students.length * 100;

        circle.fillColor = 'yellow';
        circle.fillColor.hue += percentageCompleted;

        //var percentageLocationPoint = {'x': location.x, 'y': location.y + 20};

        // while true ratkaisu ei toimi. jos ei löydy ekalla kerralla ko. positiosta mitään, niin ei löydy jatkossakaan
        // ongelma näyttäisi olevan spesifinen. ts. esim. mennessä tehtävään '9' Ohtuprojekti -kurssilla,
        // prosenttiluku päivittyy aina, mutta mennessä tehtävänää '3', ei koskaan.

        //hitTest = percentageLayer.hitTest(percentageLocationPoint);

        //console.log(percentageLocationPoint);
        //console.log("where it is: " + percentageLayer.children[assignment.number - 1].position);
        //console.log("what is says: " + percentageLayer.children[assignment.number - 1].content);

        //hitTest.item.content = Math.floor(percentageCompleted) + "%";
        
        if (Math.floor(percentageCompleted) <= 100) {
            percentageLayer.children[assignment.number - 1].content = Math.floor(percentageCompleted) + "%";
        }
        paper.view.update();
    }
})