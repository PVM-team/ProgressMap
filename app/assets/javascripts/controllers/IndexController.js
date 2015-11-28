ProgressApp.controller('IndexController', function($scope, $location, $compile, httpService) {
    placeNavigationLinksInHTML();

    function placeNavigationLinksInHTML() {
        var parent = $("#navigation-links");
        var links = getNavigationLinks();

        for (var i = 0; i < links.length; i++) {
            parent.append("<li>" + links[i] + "</li>");
        }

        makeLinksReactiveToFunctionCalls(parent);
    }

    function getNavigationLinks() {
        var links = [];

        if ($scope.getCurrentUser()) {
            links.push('<a ng-click="ownPage()">Oma sivu</a>');
            links.push('<a ng-click="infoToTeachers()">Opettajalle</a>');
            links.push('a ng-click="logOut()">Kirjaudu ulos</a>');
        }

        else {
            links.push('<a ng-click="infoToTeachers()">Opettajalle</a>');
            links.push('<a ng-click="logIn()">Kirjaudu Google-tunnuksella</a>');
        }

        return links;
    }

    function makeLinksReactiveToFunctionCalls(parent) {
        for (var i = 0; i < parent.children().length; i++) {
            var elem = parent.children()[i];
            $compile(elem)($scope);
        }       
    }

    $scope.ownPage = function () {
        console.log("ownPage")
        // $location.path('/own_page');
    }

    $scope.infoToTeachers = function () {
        console.log("infoToTeachers")

        // $location.path('/info_to_teachers');
    }

    $scope.logIn = function () {
        console.log("logIn")
        // do stuff 1
    }

     $scope.logOut = function () {
        console.log("logOut")
        // do stuff 2
    }   
})