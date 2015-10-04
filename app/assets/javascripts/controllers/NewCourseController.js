ProgressApp.controller('NewCourseController', function ($scope, $location, httpService, CanvasService) {

    $scope.assignments = []
    $scope.participants = []

    httpService.getData('/users/all', {}).then(function (data) {
        $scope.allUsers = data['users']
    })

    $scope.createCourse = function () {

        var newCourse = {
            name: $scope.name,
            assignment_count: $scope.assignmentCount,
            participants: $scope.participants
        }

        httpService.postData('/courses', newCourse).then(function (data) {
            var path = "/map/" + data.id
            $location.path(path)
        })
    }

    $scope.removeParticipant = function (participant) {
        editLists($scope.participants, $scope.allUsers, participant)
    }

    $scope.addParticipant = function (newParticipant) {
        editLists($scope.allUsers, $scope.participants, newParticipant)
    }

    function editLists(listToRemoveFrom, listToAddTo, member){
        var index = listToRemoveFrom.indexOf(member);
        listToRemoveFrom.splice(index, 1);
        listToAddTo.push(member);
    }

    function findAssignmentById(id) {
        for (var i = 0; i < $scope.assignments.length; i++) {
            if ($scope.assignments[i].id == id) {
                return $scope.assignments[i];
            }
        }
    }

    $scope.showDependencies = function (assignment) {
        for (var i = 0; i < assignment.dependencies.length; i++) {
            var dependent = findAssignmentById(assignment.dependencies[i].id);

            $("button:contains('" + dependent.number + "')").closest('button').addClass("dependent");
        }
    }

    $scope.hideDependencies = function (assignment) {
        for (var i = 0; i < assignment.dependencies.length; i++) {
            var dependent = findAssignmentById(assignment.dependencies[i].id);

            $("button:contains('" + dependent.number + "')").closest('button').removeClass("dependent");
        }
    }

    $scope.placeAssignmentButtonsOnCanvas = function () {

        $scope.assignments = []
        removeOriginalCanvas();      

        if ($scope.assignmentCount) {

            var canvasWidth = 1000;
            var borderSize = canvasWidth / 40; // 25
            var blockSize = canvasWidth / 5; // 200

            var assignmentsPerLevel = canvasWidth / (2 * borderSize + blockSize) // 4

            var levelAmount = Math.ceil($scope.assignmentCount / assignmentsPerLevel)

            CanvasService.initiateCanvas((2 * borderSize + blockSize) * levelAmount, canvasWidth, document.getElementById("mapElements"), "rgba(30, 85, 205, 0.50")

            for (var i = 0; i < $scope.assignmentCount; i++) {
                var location = drawLocationForAssignment(i, assignmentsPerLevel, levelAmount, borderSize, blockSize)

                var assignment = {'number': i + 1, 'location': location, 'doers': {}, 'dependencies': {} }

                $scope.assignments.push(assignment)
            }

            CanvasService.drawSmoothPaths(getLocations())
        }
    }

    function drawLocationForAssignment(i, assignmentsPerLevel, levelAmount, borderSize, blockSize) {
        var xStart = borderSize + (i % assignmentsPerLevel * (2 * borderSize + blockSize))

        var level = Math.ceil(levelAmount - (i / assignmentsPerLevel)) - 1

        var yStart = borderSize + level * (2 * borderSize + blockSize)

        var x = getRandomPosition(xStart, blockSize)
        var y = getRandomPosition(yStart, blockSize)

        return {'x': x, 'y': y};
    }

    function removeOriginalCanvas() {
        var canvasArray = document.getElementsByTagName("canvas");

        if (canvasArray && canvasArray[0]) {
            canvasArray[0].remove();
        }        
    }

    function getRandomPosition(start, blockSize) {
        return Math.floor((Math.random() * blockSize) + start);
    }

    function getLocations() {
        var locations = []

        for (var i = 0; i < $scope.assignments.length; i++) {
            locations.push([$scope.assignments[i].location.x, $scope.assignments[i].location.y])
        }
        return locations    
    }
})