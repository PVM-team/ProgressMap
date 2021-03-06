ProgressApp.controller('MapController', function($scope, $routeParams, $location, httpService, CanvasService, AssignmentDependenciesService) {
    $scope.buttonClicked = false;

    // pidettäiskö täälläkin assignmentit sortattuna numeron perusteella? Ei tarvitse indexOf hakuja.

    //initiates map with given course id and current student id
    httpService.getData('/map/init.json', { params: { course_id: $routeParams.course_id }}).then(function (data) {
        if (!validRequest(data)) {
            $location.path("/");
            return;
        }

        $scope.course = data["course"][0];
        $scope.assignments = data["assignments"];
        $scope.students = data["students"];

        $scope.currentStudent = $scope.students[0];
        $scope.doneAssignments = setDoneAssignments();

        CanvasService.initiateCanvas('canvas', $scope.assignments.length, 1000, document.getElementById("mapElements"));
        CanvasService.drawSmoothPaths($scope.assignments);
    })


    $scope.moveToCourseCreationView = function () {
        $location.path("/course/new");
    }

    $scope.moveToCourseEditView = function () {
        $location.path('/course/' + $scope.course.id + '/edit');
    }

    $scope.showDependencies = function (assignment) {
        AssignmentDependenciesService.showDependencies(assignment, $scope.assignments, CanvasService.getContext());
    }

    $scope.hideDependencies = function (assignment) {
        AssignmentDependenciesService.hideDependencies(assignment, $scope.assignments);
        CanvasService.redraw("rgba(30, 85, 205, 0.50");
        CanvasService.drawSmoothPaths($scope.assignments);
    }

    $scope.markAssignmentAsDone = function (assignment) {
        $scope.buttonClicked = true;

        var data = {
            assignment_id: assignment.id,
            student_id: $scope.currentStudent.id,
            complete: true
        }

        httpService.postData('students_tasks/update', data).then(function (data) {
            $scope.doneAssignments.push(assignment);
            assignment.doers.push($scope.currentStudent);

            $scope.buttonClicked = false;
        })
    }

    $scope.markAssignmentAsUndone = function (assignment) {
        $scope.buttonClicked = true;

        var data = {
            assignment_id: assignment.id,
            student_id: $scope.currentStudent.id,
            complete: false
        }

        httpService.postData('students_tasks/update', data).then(function (data) {
            var i = $scope.doneAssignments.indexOf(assignment);
            
            if (i >= 0) {
                removeValueFromList($scope.doneAssignments, i);
            
                i = $scope.assignments.indexOf(assignment);
                var j = indexOfValueWithId($scope.assignments[i].doers, $scope.currentStudent.id);

                removeValueFromList($scope.assignments[i].doers, j);
            }

            $scope.buttonClicked = false;
        })
    }

    function setDoneAssignments() {
        var doneAssignments = [];

        if ($scope.currentStudent) {
            for (var i = 0; i < $scope.assignments.length; i++) {
                var doers = $scope.assignments[i].doers;

                if (indexOfValueWithId(doers, $scope.currentStudent.id) >= 0) {
                    doneAssignments.push($scope.assignments[i])
                }
            }
        }

        return doneAssignments;
    }

    $scope.viewAsStudent = function (student) {
        $scope.currentStudent = student;
        $scope.doneAssignments = setDoneAssignments();
    }


    $scope.assignmentCompleted = function (assignment) {
        return ($scope.doneAssignments.indexOf(assignment) >= 0)
    }

    function validRequest(data) {
        return data['course'][0]
    }

    function removeValueFromList(list, index) {
        list.splice(index, 1);
    }

    // $scope.currentStudent ja assignment.doers-jäsenet eivät ole tallenettu samalla tavalla, käyttäjä ei löydy suoralla vertailulla (etsitään id:n perusteella)
    function indexOfValueWithId(list, id) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                return i;
            }
        }

        return -1;
    }
    $scope.goToActionMap = function(){
        $location.path('/actionmap/' + $scope.course.id)
    }

})
