ProgressApp.service('AssignmentDependenciesService', function () {
    this.showDependencies = function(assignment, allAssignments, ctx) {
        for (var i = 0; i < assignment.dependencies.length; i++) {
            var dependent = findAssignmentById(allAssignments, assignment.dependencies[i].id);
            $("button:contains('" + dependent.number + "')").closest('button').addClass("dependent");

            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(dependent.location.x, dependent.location.y);
                ctx.lineTo(assignment.location.x, assignment.location.y);
                ctx.lineWidth = 14;
                ctx.strokeStyle = 'rgba(225, 189, 47, 0.86)';
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.stroke();

                //drawTriangleHead(ctx, assignment.location.x, assignment.location.y);
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

   /* function drawTriangleHead(ctx, x ,y){
        ctx.beginPath();
        ctx.moveTo(x, y);
        x += 25;;
        ctx.lineTo(x,(y + 25));
        ctx.lineTo(x,(y - 25));

        ctx.strokeStyle = 'rgba(225, 189, 47, 0.86)';
        ctx.fill();
    } */
})
