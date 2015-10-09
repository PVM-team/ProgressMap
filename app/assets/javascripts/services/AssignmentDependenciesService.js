ProgressApp.service('AssignmentDependenciesService', function () {
    this.showDependencies = function(assignment, allAssignments, ctx) {
        for (var i = 0; i < assignment.dependencies.length; i++) {
            var dependent = findAssignmentById(allAssignments, assignment.dependencies[i].id);
            $("button:contains('" + dependent.number + "')").closest('button').addClass("dependent");

            if (ctx) {
                drawArrow(ctx,assignment.location.x, assignment.location.y,
                    dependent.location.x, dependent.location.y);
            }
        }
    }
    this.hideDependencies = function (assignment, allAssignments) {
        for (var i = 0; i < assignment.dependencies.length; i++) {
            var dependent = findAssignmentById(allAssignments, assignment.dependencies[i].id);
            $("button:contains('" + dependent.number + "')").closest('button').removeClass("dependent");
        }
    }
    function findAssignmentById(assignments, id) {
        for (var i = 0; i < assignments.length; i++) {
            if (assignments[i].id == id) {
                return assignments[i];
            }
        }
    }

    function drawArrow(ctx, x ,y, origX, origY){
        var headLength = 20;
        var x = arrowEndPoint(x, origX);
        var y = arrowEndPoint(y, origY);
        var angle = Math.atan2(y - origY, x - origX);

        ctx.beginPath();
        ctx.moveTo(origX, origY);
        ctx.lineTo(x, y);
        ctx.moveTo(x, y);

        ctx.lineTo(x-headLength*Math.cos(angle-Math.PI/6), y-headLength*Math.sin(angle-Math.PI/6));
        ctx.moveTo(x, y);
        ctx.lineTo(x-headLength*Math.cos(angle+Math.PI/6), y-headLength*Math.sin(angle+Math.PI/6));
        ctx.lineTo(x-headLength*Math.cos(angle-Math.PI/6), y-headLength*Math.sin(angle-Math.PI/6));

        ctx.strokeStyle = 'rgba(225, 189, 47, 1)';
        ctx.fillStyle = 'rgba(225, 189, 47, 1)';
        ctx.lineWidth = 5;
        ctx.fill();
        ctx.stroke();
    }

    //returns a value of x or y that sets the endpoint of the arrow outside of the assignment button
    function arrowEndPoint(coordinateEnd, coordinateOrigin){
        if (coordinateEnd > coordinateOrigin){
            return coordinateEnd - 20;
        } else {
            return coordinateEnd + 20;
        }

    }
})
