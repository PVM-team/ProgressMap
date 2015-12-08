ProgressApp.controller('EditCourseController', function($scope, $routeParams, $location, $uibModal, httpService, InfoModalService, CanvasService, AssignmentDependenciesService) {
    $scope.showNavigation = true;
    $scope.mutex = true;

/*    if (! userHasRightToSeeThisView()) {
        $location.path('/');
    }
*/
    httpService.getData('courses/show', { params: { course_id: $routeParams.course_id }}).then(function(data) {
        $scope.course = data['course'][0];
        $scope.assignments = data["assignments"];
        $scope.students = data["students"];

        $scope.name = $scope.course.name;

        CanvasService.initiateCanvas('canvas', $scope.assignments.length, 1000, document.getElementById("mapElements"));
        CanvasService.drawSmoothPaths($scope.assignments);

        $scope.mutex = false;
    })

    $scope.editCourseName = function() {
        $scope.mutex = true;

        var data = {
            course_id: $scope.course.id,
            name: $scope.name
        }

        httpService.putData('/courses/edit_name', data).then(function (data) {
            $scope.course.name = data['course'].name;
            editNameOfTheCourseInCoursesOfCurrentUser();

            InfoModalService.newInfoModal("Kurssin nimi vaihdettu onnistuneesti.", "success");
            $scope.mutex = false;
        })
    }

    $scope.newAssignmentModal = function() {
        assignmentModal({ name: "", number: $scope.assignments.length + 1, dependencies: [] }, true);
    }

    $scope.editAssignmentModal = function(assignment) {
        assignmentModal(assignment);
    }

    function assignmentModal(assignment, new_record) {
        var modalInstance = $uibModal.open({
            templateUrl: 'templates/modals/assignment.html',
            controller: 'AssignmentController', // sivun alaosassa
            size: 'lg',
            scope: $scope,
            resolve: {
                assignment: function () {
                    return assignment;
                },
                new_record: function() {
                    return new_record;
                }
            }
        });        
    }


    $scope.newStudentModal = function() {
        studentModal({ firstName: "", lastName: "", email: "" }, true);
    }

    $scope.editStudentModal = function(student) {
        studentModal(student);
    }

    function studentModal(student, new_record) {
        var modalInstance = $uibModal.open({
            templateUrl: 'templates/modals/student.html',
            controller: 'StudentController', // sivun alaosassa
            size: 'lg',
            scope: $scope,
            resolve: {
                student: function() {
                    return student;
                },
                new_record: function() {
                    return new_record;
                }
            }
        });        
    }


    $scope.showDependencies = function (assignment) {
        //AssignmentDependenciesService.showDependencies(assignment, $scope.assignments);
    }

    $scope.hideDependencies = function (assignment) {
        //AssignmentDependenciesService.hideDependencies(assignment, $scope.assignments);
    }

    function userHasRightToSeeThisView() {
        var teacher = $scope.currentUser;

        if (teacher) {
            var courses = teacher.courses;
            
            for (var i = 0; i < courses.length; i++) {
                if (courses[i].id == $routeParams.course_id) {
                    return true;
                }
            }
        }
        return false;
    }

    function editNameOfTheCourseInCoursesOfCurrentUser() {
        for (var i = 0; i < $scope.currentUser.courses.length; i++) {
            if ($scope.currentUser.courses[i].id == $scope.course.id) {
                $scope.currentUser.courses[i].name = $scope.course.name
                return;
            }
        }
    }


    /* $scope.deleteStudent = function(student) {
        var index = $scope.students.indexOf(student);

        httpService.deleteData('students/' + student.id).then(function (data) {
            $scope.students.splice(index, 1);
        })
    } */
})

ProgressApp.controller('AssignmentController', function($scope, $uibModalInstance, InfoModalService, CanvasService, httpService, assignment, new_record) {
    $scope.original_name = assignment.name;

    if ($scope.original_name.length == 0) {
        $scope.original_name = "Uusi tehtävä";
    }

    $scope.new_name = assignment.name;
    $scope.new_number = assignment.number;
    $scope.new_record = new_record;

    var originalDependencies = originalDependencies();


    function originalDependencies() {
        var original = [];

        for (var i = 0; i < $scope.assignments.length; i++) {
            original.push(false);
        }

        for (var i = 0; i < assignment.dependencies.length; i++) {
            original[assignment.dependencies[i].number - 1] = true;
        }

        return original;
    }

    $scope.originalDependency = function(assignment) {
        return originalDependencies[assignment.number - 1];
    }

    $scope.back = function() {
        $uibModalInstance.close();
    }

    $scope.submitData = function() {
        $scope.mutex = true;

        var params = {
            name: $scope.new_name,
            number: $scope.new_number,
            dependencies: numberArray(selectedDependencies())
        }

        if (new_record) {
            createAssignment(params);
            return;
        }

        updateAssignment(params);
    }

    /*
        Hakee jokaiselta <input type=checkbox ...> elementiltä attribuutin 'checked' arvon ja palauttaa tämän [true / false] taulukkona.
    */

    function selectedDependencies() {
        var selected = [];
        var ul_tags = $("#dependencies").children();

        for (var i = 0; i < ul_tags.length; i++) {
            selected.push(ul_tags[i].children[0].children[0].checked);
        }

        return selected;
    }

    /*
        Kääntää [true / false] muotoisen riippuvuus/esitieto -taulukon numeromuotoiseksi.
        Esim. [false, true, true, false, false] tarkoittaa, että esitiedoiksi valittu tehtävät '2' ja '3' ja palauttaa
        arrayn [{'number': 2}, {'number': 3}].
    */

    function numberArray(selectedDependencies) {
        var numberArray = [];

        for (var i = 0; i < selectedDependencies.length; i++) {
            if (selectedDependencies[i]) {
                numberArray.push({'number': i + 1});
            }
        }

        return numberArray;
    }


    function createAssignment(assignmentParams) {
        var previousLocation = locationOfLastAssignment();
        var location = CanvasService.locationOfNewAssignment($scope.assignments.length, previousLocation);

        var data = {
            course_id: $scope.course.id,
            location: location,
            name: assignmentParams.name,
            number: assignmentParams.number,
            dependencies: assignmentParams.dependencies
        }

        $uibModalInstance.close();

        httpService.postData('/assignments', data).then(function (data) {
            $scope.assignments.push(data['assignment'][0]);

            if (CanvasService.lastLevelFull($scope.assignments.length - 1)) {
                moveAllLocationsDownByOneLevel();
            }

            else {
                reDrawCanvas();
                $scope.mutex = false;
            }

            InfoModalService.newInfoModal("Tehtävä luotu onnistuneesti.", "success");
        })
    }

    function updateAssignment(assignmentParams) {
        $uibModalInstance.close();

        httpService.putData('/assignments/' + assignment.id, assignmentParams).then(function (data) {
            InfoModalService.newInfoModal("Tehtävän tiedot päivitetty.");
            $scope.assignments[assignment.number - 1] = data['assignment'][0];

            $scope.mutex = false;
        })
    }


    function locationOfLastAssignment() {
        for (var i = $scope.assignments.length - 1; i >= 0; i--) {
            if ($scope.assignments[i].number == $scope.assignments.length) {
                return $scope.assignments[i].location;
            }
        }
    }

    function moveAllLocationsUpByOneLevel() {
        moveAllLocationsToDirection("up");
    }

    function moveAllLocationsDownByOneLevel() {
        moveAllLocationsToDirection("down");
    }

    function moveAllLocationsToDirection(direction) {
        var move = CanvasService.levelHeight();

        if (direction === 'up') {
            move *= -1;
        }

        var data = {
            course_id: $scope.course.id,
            move: move
        }

        httpService.postData('locations/move', data).then(function (data) {
            $scope.assignments = data['assignment'];
            reDrawCanvas();

            $scope.mutex = false;
        })
    }

    function reDrawCanvas() {
        removeOriginalCanvas();

        CanvasService.initiateCanvas('canvas', $scope.assignments.length, 1000, document.getElementById("mapElements"));
        CanvasService.drawSmoothPaths($scope.assignments);
    }

    function removeOriginalCanvas() {
        var canvasArray = document.getElementsByTagName("canvas");

        if (canvasArray && canvasArray[0]) {
            canvasArray[0].remove();
        }
    }

    $scope.confirmDelete = function() {
        return $scope.confirmation != assignment.name;
    }

    $scope.deleteAssignment = function() {
        $scope.mutex = true;

        var number = assignment.number;
        var location = assignment.location;

        $uibModalInstance.close();

        httpService.deleteData('assignments/' + assignment.id).then(function (data) {
            $scope.assignments.splice(number - 1, 1);
            decreaseNumbersOfFollowingAssignments(number, location);
        })        
    }

    function decreaseNumbersOfFollowingAssignments(number, location) {
        var data = {
            course_id: $scope.course.id,
            location: location,
            number: number
        }

        httpService.postData('assignments/decrease_numbers', data).then(function (data) {
            $scope.assignments = data['assignment'];

            if (CanvasService.lastLevelFull($scope.assignments.length)) {
                moveAllLocationsUpByOneLevel();
            } else {
                reDrawCanvas();
                $scope.mutex = false;
            }

            InfoModalService.newInfoModal("Tehtävä poistettu onnistuneesti.", "danger");
        })
    }
})


ProgressApp.controller('StudentController', function($scope, $uibModalInstance, httpService, InfoModalService, student, new_record) {
    $scope.original_name = student.firstName + " " + student.lastName;

    if ($scope.original_name.length < 2) {
        $scope.original_name = "Uusi opiskelija";
    }

    $scope.new_first_name = student.firstName;
    $scope.new_last_name = student.lastName;
    $scope.new_email = student.email;
    $scope.new_record = new_record;


    $scope.submitData = function() {
        $scope.mutex = true;

        var params = {
            firstName: $scope.new_first_name,
            lastName: $scope.new_last_name,
            email: $scope.new_email
        }

        if (new_record) {
            createStudent(params);
            return;
        }

        updateStudent(params);
    }

    function createStudent(params) {
        var data = {
            course_id: $scope.course.id,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email
        }

        $uibModalInstance.close();

        httpService.postData('/students', data).then(function(data) {
            $scope.students.push(data['student'][0]);
            InfoModalService.newInfoModal("Opiskelija luotu onnistuneesti.", "success");

            $scope.mutex = false;
        })
    }

    function updateStudent(params) {
        $uibModalInstance.close();

        httpService.putData('/students/' + student.id, params).then(function(data) {
            updateStudentInfo();
            InfoModalService.newInfoModal("Opiskelijan tiedot päivitetty.");

            $scope.mutex = false;
        })
    }

    function updateStudentInfo() {
        student.firstName = $scope.new_first_name;
        student.lastName = $scope.new_last_name;
        student.email = $scope.new_email;
    }

    $scope.back = function() {
        $uibModalInstance.close();
    }
})