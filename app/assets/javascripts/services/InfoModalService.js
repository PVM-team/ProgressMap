ProgressApp.service('InfoModalService', function($uibModal) {

  this.newInfoModal = function(message, type, size) {
    if (! size) {
      size = 'md';
    }

    var color = defineColor(type);

    $uibModal.open({
      templateUrl: 'templates/modals/infoModal.html',
      controller: 'InfoModalController',
      size: size,
      resolve: {
       	message: function() {
       		return message;
       	},
       	color: function() {
       		return color;
       	}
      }
    });
  }

  function defineColor(type) {
    switch(type) {
      case 'success': return "green";
      case 'warning': return "yellow";
      case 'error': return "red";
      default: return "blue";
    }
  }
})

ProgressApp.controller('InfoModalController', function($scope, message, color) {
	$scope.message = message;
	$scope.color = color;
})