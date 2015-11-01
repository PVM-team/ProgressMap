ProgressApp.controller('ActionMapController', function ($scope, $routeParams, $location, httpService, CanvasService, StateService) {

    var self = this;
    var maxStudentsToShowAroundAssignment = 5;

    var interval = setInterval(function() {
        self.updateLatestAssignments();
    }, 5000);

    httpService.getData('/map/action_init.json', { params: { course_id: $routeParams.course_id } }).then(function (data) {

        $scope.course = data["course"][0];

        $scope.students = data["students"];         // tulee suorittaa ennen "$scope.assignments =" riviä liittyen direktiivin paperjsactionmap toimintaan.
        $scope.assignments = data["assignments"];

        //no longer working as is
        //CanvasService.initiatePaperCanvas('canvas3', $scope.assignments.length, 1000);

        sortAssignmentsByNumber();
        assignLatestDoersForAssignments();
    })

    $scope.$on("$destroy", function() {
        clearInterval(interval);
    });

    $scope.goToNormalMap = function() {
        $location.path('/map/' + $scope.course.id);
    }

    this.updateLatestAssignments = function() {
        httpService.getData('/map/action_init.json', { params: { course_id: $routeParams.course_id } }).then(function (data) {
            $scope.students = data["students"];
        })
    }

    function sortAssignmentsByNumber() {
        $scope.assignments.sort(function (a, b) {
            return a.number - b.number;
        })
    }

    function assignLatestDoersForAssignments() {
        addLatestDoersArrayForEachAssignment();
        addEachStudentToLatestDoersOfAssignmentTheyBelong();
        sortLatestDoersForEachAssignment();
        removeStudentsFromLatestDoersIfThereAreTooMany();

    }

    function addLatestDoersArrayForEachAssignment() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            $scope.assignments[i]['latestDoers'] = [];
        }
    }

    function addEachStudentToLatestDoersOfAssignmentTheyBelong() {
         for (var i = 0; i < $scope.students.length; i++) {
            var student = $scope.students[i];

            if (student.lastDoneAssignment) {
                $scope.assignments[student.lastDoneAssignment.number - 1].latestDoers.push(student);
            }
        }
    }
    
    function removeStudentsFromLatestDoersIfThereAreTooMany() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            removeStudentsFromLatestDoersOfAssignmentIfThereAreTooMany($scope.assignments[i]);
        }
    }

    function removeStudentsFromLatestDoersOfAssignmentIfThereAreTooMany(assignment) {
        var doers = assignment.latestDoers;

        if (doers.length > maxStudentsToShowAroundAssignment) {
            var new_doers = [];

            for (var j = 0; j < maxStudentsToShowAroundAssignment; j++) {
                new_doers.push(doers[j]);
            }
            assignment.latestDoers = new_doers;
        }
    }

    function sortLatestDoersForEachAssignment() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            sortLatestDoersForAssignment($scope.assignments[i]);
        }
    }

    function sortLatestDoersForAssignment(assignment) {
        assignment.latestDoers.sort(function (a, b) {
            return new Date(b.lastDoneAssignment.timestamp) - new Date(a.lastDoneAssignment.timestamp);
        })
    }

    $scope.locationOfStudentInMap = function(student, assignment) {
        var studentButtonWidth = 25;
        var studentButtonHeight = 25;
        var radius = 40;

        var step = 2 * Math.PI / assignment.latestDoers.length;
        var angle = 0;

        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (student.id == assignment.latestDoers[i].id) {
                var x = Math.round(assignment.location.x + radius * Math.cos(angle) - studentButtonWidth / 2);
                var y = Math.round(assignment.location.y + radius * Math.sin(angle) - studentButtonHeight / 2);

                return { top: y + 'px', left: x + 'px' };
            }

            angle += step;
        }
    }
})
