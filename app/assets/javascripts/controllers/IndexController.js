ProgressApp.controller('IndexController', function($scope, $location, $compile, httpService, SessionService) {
    window.onSignIn = onSignIn;
   // placeNavigationLinksInHTML();

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

        if (SessionService.loggedIn()) {
            links.push('<a ng-click="ownPage()">Oma sivu</a>');
            links.push('<a ng-click="infoToTeachers()">Opettajalle</a>');
            links.push('<a ng-click="signOut()">Kirjaudu ulos</a>');
        }

        else {
            links.push('<a ng-click="infoToTeachers()">Opettajalle</a>');
            links.push('<a class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></a>');
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

    /*function onSignIn(googleUser) {
        SessionService.signIn(googleUser);
        $location.path("/");
    }*/

    /* $scope.signOut = function () {
        SessionService.signOut();
        $location.path("/");
    }*/
})
