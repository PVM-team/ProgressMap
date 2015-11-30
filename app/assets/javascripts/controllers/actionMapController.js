ProgressApp.controller('ActionMapController', function ($scope, $routeParams, $location, httpService, CanvasService, ActionMapUpdaterService) {
    "use strict";

    var self = this;
    var maxStudentsToShowAroundAssignment = 9;

    var backendCaller;
    var updater;

    httpService.getData('/map/action_init.json', { params: { course_id: $routeParams.course_id } }).then(function (data) {
        if (!validRequest(data)) {
            $location.path("/");
            return;
        }

        $scope.course = data["course"][0];

        $scope.students = data["students"];         // tulee suorittaa ennen "$scope.assignments =" riviä liittyen direktiivin paperjsactionmap toimintaan.
        $scope.assignments = data["assignments"];

        sortAssignmentsByNumber();
        assignLatestAttemptersForAssignments();

        // alustetaan intervalit täällä, kun kurssin tiedot on ensin haettu kannasta

        backendCaller = setInterval(function() {
            var data = {
                course_id: $scope.course.id,
                course_name: $scope.course.name
            }

            httpService.getData('/map/action_students.json', { params: data }).then(function (data) {
                console.log("got new data from backend")

                $scope.students = data["students"];
            })
        }, 20000);

        updater = setInterval(function() {
            if (ActionMapUpdaterService.readyForNextUpdate()) {
                ActionMapUpdaterService.update($scope.students);
            }
        }, 3000); // kysyy 3 sekunnin välein, voidaanko tilaa päivittää.        
    })


    $scope.$on("$destroy", function() {
        if (backendCaller) {
            clearInterval(backendCaller);    
        }

        if (updater) {
            clearInterval(updater);    
        }
    });

    function sortAssignmentsByNumber() {
        $scope.assignments.sort(function (a, b) {
            return a.number - b.number;
        })
    }

    function assignLatestAttemptersForAssignments() {
        addLatestAttemptersArrayForEachAssignment();
        addEachStudentToLatestAttemptersOfAssignmentTheyBelong();
        sortLatestAttemptersForEachAssignment();
        removeStudentsFromLatestAttemptersIfThereAreTooMany();

    }

    function addLatestAttemptersArrayForEachAssignment() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            $scope.assignments[i]['latestAttempters'] = [];
        }
    }

    function addEachStudentToLatestAttemptersOfAssignmentTheyBelong() {
         for (var i = 0; i < $scope.students.length; i++) {
            var student = $scope.students[i];

            if (student.lastDoneAssignment) {
                $scope.assignments[student.lastDoneAssignment.number - 1].latestAttempters.push(student);
            }
        }
    }
    
    function removeStudentsFromLatestAttemptersIfThereAreTooMany() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            removeStudentsFromLatestAttemptersOfAssignmentIfThereAreTooMany($scope.assignments[i]);
        }
    }

    function removeStudentsFromLatestAttemptersOfAssignmentIfThereAreTooMany(assignment) {
        var attempters = assignment.latestAttempters;

        if (attempters.length > maxStudentsToShowAroundAssignment) {
            var new_attempters = [];

            for (var j = 0; j < maxStudentsToShowAroundAssignment; j++) {
                new_attempters.push(attempters[j]);
            }
            assignment.latestAttempters = new_attempters;
        }
    }

    function sortLatestAttemptersForEachAssignment() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            sortLatestAttemptersForAssignment($scope.assignments[i]);
        }
    }

    function sortLatestAttemptersForAssignment(assignment) {
        assignment.latestAttempters.sort(function (a, b) {
            return new Date(b.lastDoneAssignment.timestamp) - new Date(a.lastDoneAssignment.timestamp);
        })
    }

    $scope.locationOfStudentInMap = function(student, assignment) {
        var studentButtonWidth = 25;
        var studentButtonHeight = 25;
        var radius = 40;

        var step = 2 * Math.PI / assignment.latestAttempters.length;
        var angle = 0;

        for (var i = 0; i < assignment.latestAttempters.length; i++) {

            if (student.id == assignment.latestAttempters[i].id) {
                var x = Math.round(assignment.location.x + radius * Math.cos(angle) - studentButtonWidth / 2);
                var y = Math.round(assignment.location.y + radius * Math.sin(angle) - studentButtonHeight / 2);

                return { top: y + 'px', left: x + 'px' };
            }

            angle += step;
        }
    }

    function validRequest(data) {
        return data['course'][0]
    }    
})
