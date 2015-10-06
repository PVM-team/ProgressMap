ProgressApp.service('AssignmentDependenciesService', function () {

	this.showDependencies = function(assignment, allAssignments) {
        for (var i = 0; i < assignment.dependencies.length; i++) {
            var dependent = findAssignmentById(allAssignments, assignment.dependencies[i].id);

            $("button:contains('" + dependent.number + "')").closest('button').addClass("dependent");
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
})