ProgressApp.controller('ActionMapController', function ($scope, $routeParams, $location, httpService, CanvasService, StateService) {

    var self = this;
    var maxStudentsToShowAroundAssigment = 5;

    var interval = setInterval(function() {
        self.updateLatestAssignments();
    }, 15000);

    httpService.getData('/map/action_init.json', { params: { course_id: $routeParams.course_id } }).then(function (data) {

        $scope.course = data["course"][0];
        $scope.assignments = data["assignments"];
        $scope.participants = data["participants"];

        CanvasService.initiateCanvas($scope.assignments.length, 1000, document.getElementById("actionMapElements"), "rgba(30, 85, 205, 0.50");
        CanvasService.drawSmoothPaths($scope.assignments);

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
            $scope.participants = data["participants"];

            initializeLatest();
        })
    }

    function initializeLatest() {
        for (var i = 0; i < $scope.participants.length; i++) {
            var user = $scope.participants[i];
            var lastDoneAssignment = user.lastDoneAssignment;
            
            if (lastDoneAssignment) {
                var assignmentToMoveTo = $scope.assignments[lastDoneAssignment.number - 1];

                var originalPositionForUser = userShownInMap(user);


                if (! userInLatestDoersOfAssignment(user, assignmentToMoveTo) &&
                    userShouldBeInLatestDoersOfAssignment(user, assignmentToMoveTo)) {

                    if (userShownInMap(user)) {
                        var originalPositionForUser = userShownInMap(user);

                        removeUserFromLastShownUsersOfAssignment(originalPositionForUser, user);
                        addNewUserInThePlaceOfRemovedOneIfSuchExists(originalPositionForUser);
                    }

                    replaceLastShownUserOfAssignmentWithUser(assignmentToMoveTo, user);
                }
            }
        }
    }

    function removeUserFromLastShownUsersOfAssignment(assignment, user) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {
            if (user.id == assignment.latestDoers[i].id) {
                assignment.latestDoers.splice(i, 1);
            }
        }
    }

    function addNewUserInThePlaceOfRemovedOneIfSuchExists(assignment) {
        var userToAdd = null;

        for (var i = 0; i < $scope.participants.length; i++) {
            var user = $scope.participants[i];

            if (user.lastDoneAssignment &&
                user.lastDoneAssignment.number == assignment.number &&
                ! userInLatestDoersOfAssignment(user, assignment)) {

                if (! userToAdd) {
                    userToAdd = user;
                }

                else if (user1HasDoneLastDoneAssignmentAfterUser2(userToAdd, user)) {
                    userToAdd = user;
                }
            }
        }

        if (userToAdd) {
            assignment.latestDoers.push(userToAdd);
            sortLatestDoersForAssignment(assignment);
        }
    }

    function replaceLastShownUserOfAssignmentWithUser(assignment, user) {
        if (assignment.latestDoers.length == maxStudentsToShowAroundAssigment) {
            assignment.latestDoers.pop();    
        }

        assignment.latestDoers.push(user);
        sortLatestDoersForAssignment(assignment);
    }

    function userShownInMap(user) {
        for (var i = 0; i < $scope.assignments.length; i++) {

            for (var j = 0; j < $scope.assignments[i].latestDoers.length; j++) {

                if (userInLatestDoersOfAssignment(user, $scope.assignments[i])) {
                    return $scope.assignments[i];
                }
            }
        }
        return null;
    }

    function userInLatestDoersOfAssignment(user, assignment) {
        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (user.id == assignment.latestDoers[i].id) {
                return true;
            }
        }
        return false;
    }

    function userShouldBeInLatestDoersOfAssignment(user, assignment) {
        if (user.lastDoneAssignment) {

            if (assignment.latestDoers.length < maxStudentsToShowAroundAssigment) {
                return true;
            }

            for (var i = 0; i < assignment.latestDoers.length; i++) {
                if (user1HasDoneLastDoneAssignmentAfterUser2(user, assignment.latestDoers[i])) {
                    return true;
                }
            }
        }
        return false;
    }

    function sortAssignmentsByNumber() {
        $scope.assignments.sort(function (a, b) {
            return a.number - b.number;
        })
    }

    function assignLatestDoersForAssignments() {
        addLatestDoersArrayForEachAssignment();
        addEachUserToLatestDoersOfAssignmentTheyBelong();
        sortLatestDoersForEachAssignment();
        removeUsersFromLatestDoersIfThereAreTooMany();

    }

    function addLatestDoersArrayForEachAssignment() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            $scope.assignments[i]['latestDoers'] = [];
        }
    }

    function addEachUserToLatestDoersOfAssignmentTheyBelong() {
         for (var i = 0; i < $scope.participants.length; i++) {
            var user = $scope.participants[i];

            if (user.lastDoneAssignment) {
                $scope.assignments[user.lastDoneAssignment.number - 1].latestDoers.push(user);
            }
        }
    }
    
    function removeUsersFromLatestDoersIfThereAreTooMany() {
        for (var i = 0; i < $scope.assignments.length; i++) {
            removeUsersFromLatestDoersOfAssignmentIfThereAreTooMany($scope.assignments[i]);
        }
    }

    function removeUsersFromLatestDoersOfAssignmentIfThereAreTooMany(assignment) {
        var doers = assignment.latestDoers;

        if (doers.length > maxStudentsToShowAroundAssigment) {
            //sortLatestDoersForAssignment(assignment);

            var new_doers = [];

            for (var j = 0; j < maxStudentsToShowAroundAssigment; j++) {
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

    function user1HasDoneLastDoneAssignmentAfterUser2(user1, user2) {
        return new Date(user1.lastDoneAssignment.timestamp) - new Date(user2.lastDoneAssignment.timestamp) > 0;
    }

    $scope.locationOfStudentInMap = function(participant, assignment) {
        var studentButtonWidth = 25;
        var studentButtonHeight = 25;
        var radius = 40;

        var step = 2 * Math.PI / assignment.latestDoers.length;
        var angle = 0;

        for (var i = 0; i < assignment.latestDoers.length; i++) {

            if (participant.id == assignment.latestDoers[i].id) {
                var x = Math.round(assignment.location.x + radius * Math.cos(angle) - studentButtonWidth / 2);
                var y = Math.round(assignment.location.y + radius * Math.sin(angle) - studentButtonHeight / 2);

                return { top: y + 'px', left: x + 'px' };
            }

            angle += step;
        }
    }
})
