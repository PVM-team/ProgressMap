ProgressApp.directive('actionmap', function (PathService, GravatarService, CanvasService, AssignmentCirclesService, ActionMapUpdaterService, MapScaleService) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            assignments: '=',
            students: '='
        },
        link: function (scope, element, attrs) {
            var mapInitialized = false;
            var maxStudentsInRow = 3;

            var smoothConfig = {
                method: 'lanczos',
                clip: 'clamp',
                lanczosFilterSize: 10,
                cubicTension: 0
            };

            paper.install(window);
            paper.setup(element[0]);

            var pathLayer = new paper.Layer();
            var assignmentLayer = new paper.Layer();
            var labelLayer = new paper.Layer();
            var percentageLayer = new paper.Layer();
            var studentLayer = new paper.Layer();

            scope.$watch('assignments', function (newval, oldval) {

                if (newval && !mapInitialized) {
                    CanvasService.initiatePaperCanvas(element[0], scope.assignments.length, 1000);
                    PathService.drawSmoothPaperPaths(getLocations(), pathLayer);
                    placeCirclesOnAssignmentLocations();
                    placeLatestStudents();

                    mapInitialized = true;

                    ActionMapUpdaterService.initialize(scope.assignments, studentLayer, assignmentLayer, percentageLayer);

                    window.onresize();
                    paper.view.draw();
                }
            }, true);

            window.onresize = function () {
                if (MapScaleService.getPreviousWindowWidth() != window.innerWidth) {

                    updateCanvasWidth();
                    MapScaleService.scaleItems(labelLayer);
                    MapScaleService.scaleItems(assignmentLayer);
                    MapScaleService.scaleItems(studentLayer);
                    MapScaleService.scaleItems(percentageLayer);
                    MapScaleService.scalePath(pathLayer);

                    ActionMapUpdaterService.updateAssignmentLocations();
                    ActionMapUpdaterService.updateAssignmentsLatestAttemptersLocations();

                    MapScaleService.setPreviousWindowWidth(window.innerWidth);
                }
            }

            function updateCanvasWidth() {
                var canvas = element[0];
                var width = window.innerWidth;

                canvas.width = width;
                paper.view.viewSize.width = width;

                paper.view.draw();
            }

            function placeLatestStudents() {
                for (var i = 0; i < scope.assignments.length; i++) {
                    placeStudentIconsForAssignment(scope.assignments[i]);
                }
            }

            function placeStudentIconsForAssignment(assignment) {
                var verticalPositionOffset = 0;
                var lateralPositionOffset = 50;
                var location = assignment.location;

                studentLayer.activate()

                for (var j = 0; j < assignment.latestAttempters.length; j++) {
                    var studentLocation = new paper.Point(location.x + lateralPositionOffset, location.y + verticalPositionOffset);
                    var student = assignment.latestAttempters[j];

                    var studentIcon = GravatarService.gravatarImage(student);
                    studentIcon.position = studentLocation;

                    ActionMapUpdaterService.initializeLatestDoer(student, studentLocation);

                    lateralPositionOffset += 30;

                    if ((j + 1) % maxStudentsInRow == 0) {
                        verticalPositionOffset += 30;
                        lateralPositionOffset = 50;
                    }
                }
            }

            function placeCirclesOnAssignmentLocations() {
                for (var i = 0; i < scope.assignments.length; i++) {
                    AssignmentCirclesService.createActionMapAssignment(scope.assignments[i], scope.students, assignmentLayer, percentageLayer, labelLayer);
                }
            }

            function getLocations() {
                var locations = [];

                for (var i = 0; i < scope.assignments.length; i++) {
                    locations.push([scope.assignments[i].location.x, scope.assignments[i].location.y]);
                }
                return locations;
            }
        }
    }
})
