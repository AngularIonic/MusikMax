angular.module('musikMax.controllers', [])
.controller('AppCtrl', [
  '$q',
  '$scope',
  '$rootScope',
  '$ionicModal',
  '$ionicLoading',
  '$ionicScrollDelegate',
  '$ionicPlatform',
  '$state',
  '$ionicHistory',
  '$cordovaCamera',
  'musicService',
  'pageService',
  function($q, $scope, $rootScope, $ionicModal, $ionicLoading, $ionicScrollDelegate, $ionicPlatform, $state, $ionicHistory, $cordovaCamera, musicService, pageService) {
    // Funktion für Pull-To-Refresh
    $scope.refresh = function () {
      musicService.getGenres().then(function (genres) {
        $scope.genres = genres;
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    // Initiales Laden der Daten
    $q.all([musicService.getGenres(), pageService.get()]).then(function (results) {
      $scope.genres = results[0];
      $scope.pages = results[1];
    });

    // Aktualisiere Genre
    $scope.$on('reloadMusic', function () {
      $scope.refresh();
    });

    // Erzeuge Erstell-Modal
    $ionicModal.fromTemplateUrl('templates/create.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });
    // Setze Standardwerte
    $scope.newEntry = {
      genre: '',
      rating: 0,
      favorite: false,
      listened: false,
      year: '',
      cover: '',
      comment: '',
      media: {
        lp: false,
        mp3: false,
        cd: false
      }
    };
    // Modal öffnen
    $scope.openModal = function () {
      $scope.modal.show().then(function () {
        // Vorherige Scroll-Position zurcksetzen
        $ionicScrollDelegate.$getByHandle('createModal').resize();
        $ionicScrollDelegate.$getByHandle('createModal').scrollTop();
      });
    };
    // Modal schließen
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    // Neuen Eintrag erzeugen
    $scope.create = function () {
      $ionicLoading.show({
        template: 'Bitte warten ...'
      });

      musicService.create($scope.newEntry).then(function () {
        $ionicLoading.hide();
        $scope.newEntry = {
          genre: '',
          rating: 0,
          cover: '',
          favorite: false,
          listened: false,
          year: '',
          comment: '',
          media: {
            lp: false,
            mp3: false,
            cd: false
          }
        };
        // Schließe Modal
        $scope.modal.hide().then(function() {
          $ionicHistory.nextViewOptions({
            animation: false,
            historyRoot: true
          });
          // Gehe aufs Dashboard
          $state.go('app.dashboard').then(function () {
            // Informiere alle Controller darüber
            $rootScope.$broadcast('reloadMusic');
          });
        });
      }, function () {
        $ionicLoading.hide();
      });
    };

    $scope.getPicture = function () {
      // Setze Kamera-Optionen
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 1000,
        targetHeight: 1000,
        saveToPhotoAlbum: true
      };
      $ionicPlatform.ready(function() {
        // Starte Kamera
        $cordovaCamera.getPicture(options).then(function(imageData) {
          // Setze Cover
          $scope.newEntry.cover = 'data:image/jpeg;base64,' + imageData;
        });
      });
    };
  }
])

.controller('ListCtrl', [
  '$q',
  '$scope',
  '$stateParams',
  '$ionicLoading',
  '$ionicPopup',
  'musicService',
  function($q, $scope, $stateParams, $ionicLoading, $ionicPopup, musicService) {
    $scope.genre = {};

    // Lade Musikdaten
    function loadData(genreAlias) {
      var deferred = $q.defer();
      $scope.genreAlias = genreAlias;
      if (genreAlias !== 'alle') {
        musicService.getOneGenre(genreAlias).then(function (genre) {
          $scope.genre = genre;
        });
      } else {
        genreAlias = undefined;
        $scope.genre.label = 'Alle';
      }
      // Hole Einträge gefiltert nach Genre
      musicService.get(undefined, true, genreAlias).then(function (music) {
        $scope.music = music;
        deferred.resolve();
      }, deferred.reject);

      return deferred.promise;
    }
    // Lade Daten, wenn neues Genre aufgerufen wird
    $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      // Tue nichts, falls Genre das gleiche oder Zustandswechsel
      if (toParams.genre === fromParams.genre || toState.name !== fromState.name) {
        return true;
      }
      // Lade Genre-Informationen
      $scope.listLoading = true;
      loadData(toParams.genre).finally(function () {
        $scope.listLoading = false;
      });
    });

    // Initialies Laden
    $scope.listLoading = true;
    loadData($stateParams.genre).finally(function () {
      $scope.listLoading = false;
    });

    // Funktion für Pull-To-Refresh
    $scope.refresh = function () {
      loadData($scope.genreAlias).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    // Eintrage löschen
    $scope.remove = function (id) {
      $ionicPopup.show({
        title: 'Eintrag löschen',
        template: 'Soll der Eintrag wirklich gelöscht werden?',
        buttons: [{
          text: 'Nein',
          type: 'button-default'
        }, {
          text: 'Ja',
          type: 'button-assertive',
          onTap: function() {
            $ionicLoading.show({
              template: 'Bitte warten...'
            });
            musicService.delete(id).then(function () {
              loadData($scope.genreAlias);
              $scope.$emit('reloadMusic');
            }).finally(function () {
              $ionicLoading.hide();
            });
          }
        }]
      });
    };
  }
])

.controller('PageCtrl', [
  '$scope',
  '$stateParams',
  '$sce',
  'pageService',
  function($scope, $stateParams, $sce, pageService) {
    // Initiales Laden der Daten
    $scope.pageLoading = true;
    pageService.getOne($stateParams.alias).then(function (page) {
      $scope.title = page.title;
      $scope.text = $sce.trustAsHtml(page.text);
    }).finally(function () {
      $scope.pageLoading = false;
    });
  }
])

.controller('DashboardCtrl', [
  '$scope',
  '$q',
  '$ionicSlideBoxDelegate',
  'musicService',
  function($scope, $q, $ionicSlideBoxDelegate, musicService) {

    function loadData() {
      var deferred = $q.defer();
      // Hole letzten fünf Einträge und lade Statistik
      $q.all([musicService.get(5), musicService.stats()]).then(function (results) {
        $scope.last = results[0];
        $scope.stats = results[1];
        $ionicSlideBoxDelegate.update();
        deferred.resolve();
      }, deferred.reject);

      return deferred.promise;
    }
    // Initiales Laden der Daten
    $scope.dashboardLoading = true;
    loadData().finally(function () {
      $scope.dashboardLoading = false;
    });
    // Funktion für Pull-To-Refresh
    $scope.refresh = function () {
      loadData().finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.$on('reloadMusic', $scope.refresh);
  }
])
.controller('DetailCtrl', [
  '$scope',
  '$stateParams',
  'musicService',
  function($scope, $stateParams, musicService) {
    // Daten laden
    $scope.entryLoading = true;
    musicService.getOne($stateParams.id).then(function (entry) {
      $scope.entry = entry;
    }).finally(function () {
      $scope.entryLoading = false;
    });
    // Setzen der Bewertung
    $scope.rate = function (rating) {
      musicService.update($scope.entry.id, {
        rating: rating === $scope.entry.rating ? 0 : rating
      }).then(function (entry) {
        $scope.entry = entry;
      });
    };
    // Setze "bereits gehört" Status
    $scope.listened = function () {
      musicService.update($scope.entry.id, {
        listened: !$scope.entry.listened
      }).then(function (entry) {
        $scope.entry = entry;
      });
    };
    // (De)Favorisieren
    $scope.favorize = function () {
      musicService.update($scope.entry.id, {
        favorite: !$scope.entry.favorite
      }).then(function (entry) {
        $scope.entry = entry;
      });
    };
  }
]);
