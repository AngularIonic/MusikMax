// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('musikMax', ['ngCordova', 'ionic', 'musikMax.controllers', 'musikMax.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.dashboard', {
    url: '/dashboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      }
    }
  })

  .state('app.list', {
    url: '/list/:genre',
    views: {
      'menuContent': {
        templateUrl: 'templates/list.html',
        controller: 'ListCtrl'
      }
    }
  })

  .state('app.detail', {
    url: '/detail/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/detail.html',
        controller: 'DetailCtrl'
      }
    }
  })
  .state('app.page', {
    url: '/page/:alias',
    views: {
      'menuContent': {
        templateUrl: 'templates/page.html',
        controller: 'PageCtrl'
      }
    }
  });
  // Standard-/ Fallback-URL
  $urlRouterProvider.otherwise('/app/dashboard');
});
