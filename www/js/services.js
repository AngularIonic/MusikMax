angular.module('musikMax.services', [])
.service('pageService', [
  '$q',
  '$timeout',
  'dataService',
  function ($q, $timeout, dataService) {
    // Hole alle Inhaltsseiten
    this.get = function () {
      var deferred = $q.defer();

      $timeout(function () {
        deferred.resolve(dataService.pages);
      }, 200);

      return deferred.promise;
    };
    // Frage spezielle Seite an
    this.getOne = function (alias) {
      var deferred = $q.defer(),
          page,
          i = 0;
      // Suche Seite
      for (i; i < dataService.pages.length; i = i + 1) {
        // Falls gefunden - breche schleife ab
        if (dataService.pages[i].alias === alias) {
          page = dataService.pages[i];
          break;
        }
      }
      // Falls Seite nicht gefunden, gibt Fehlercode 404 zurück
      $timeout(function () {
        if (page) {
          deferred.resolve(page);
        } else {
          deferred.reject(404);
        }
      }, 200);

      return deferred.promise;
    };
  }
])
.service('musicService', [
  '$q',
  '$timeout',
  'dataService',
  function ($q, $timeout, dataService) {
    function sortDesc(a, b) {
      // Eintrag a ist neuer als Eintrag b
      if (a.creationDate > b.creationDate) {
        return -1;
      }
      // Eintrag b ist neuer als Eintrag a
      if (a.creationDate < b.creationDate) {
        return 1;
      }
      return 0;
    }

    function sortAsc(a, b) {
      // Eintrag a ist älter als Eintrag b
      if (a.creationDate < b.creationDate) {
        return -1;
      }
      // Eintrag b ist älter als Eintrag a
      if (a.creationDate > b.creationDate) {
        return 1;
      }
      return 0;
    }

    // Hole einen Musikeintrag
    this.getOne = function (id) {
      var deferred = $q.defer(),
          entry,
          i = 0;
      // Suche Eintrag
      for (i; i < dataService.music.length; i = i + 1) {
        // Falls gefunden - breche Schleife ab
        if (dataService.music[i].id.toString() === id) {
          entry = dataService.music[i];
          break;
        }
      }
      // Falls Eintrag nicht gefunden, gibt Fehlercode 404 zurück
      $timeout(function () {
        if (entry) {
          // Erstelle Kopie, um Referenz aufzulösen
          deferred.resolve(angular.copy(entry));
        } else {
          deferred.reject(404);
        }
      }, 200);

      return deferred.promise;
    };

    // Erstellen eines Eintrags
    this.create = function (data) {
      var deferred = $q.defer();

      // Setzen der ID
      data.id = dataService.music.length;
      // Setze Erstelldatum
      data.creationDate = new Date().getTime();
      // Eintrag hinzufügen
      dataService.music.push(data);

      $timeout(function () {
          deferred.resolve();
      }, 200);

      return deferred.promise;
    };

    // Ändern eines Eintrags
    this.update = function (id, data) {
      var deferred = $q.defer(),
          entry,
          i = 0;
      // Suche Eintrag
      for (i; i < dataService.music.length; i = i + 1) {
        // Falls gefunden - breche Schleife ab
        if (dataService.music[i].id === id) {
          entry = angular.merge(dataService.music[i], data);
          break;
        }
      }
      // Falls Eintrag nicht gefunden, gibt Fehlercode 404 zurück
      $timeout(function () {
        if (entry) {
          // Erstelle Kopie, um Referenz aufzulösen
          deferred.resolve(angular.copy(entry));
        } else {
          deferred.reject(404);
        }
      }, 200);

      return deferred.promise;
    };

    // Hole Musikeinträge
    this.get = function (limit, orderDesc, genre) {
      // Standardsortierung
      orderDesc = orderDesc || true;
      // Sortierfunktion setzen
      var sortFunc = orderDesc ? sortDesc : sortAsc,
          deferred = $q.defer(),
          sortMusic = [],
          filterMusic = [],
          i = 0,
          limitMusic = [];
      // Liste sortieren
      sortMusic = dataService.music.sort(sortFunc);
      // Nach Genre filtern
      if (genre) {
        for (i; i < sortMusic.length; i = i + 1) {
          if (sortMusic[i].genre === genre) {
            filterMusic.push(sortMusic[i]);
          }
        }
      } else {
        filterMusic = sortMusic;
      }
      // Hole Anzahl an Einträgen
      if (limit) {
        for (i; i < filterMusic.length; i = i + 1) {
          if (i >= limit) {
            break;
          }
          limitMusic.push(filterMusic[i]);
        }
      } else {
        // Alle Einträge
        limitMusic = filterMusic;
      }

      $timeout(function () {
        // Kopie zur Referenzauflösung
        deferred.resolve(angular.copy(limitMusic));
      }, 500);

      return deferred.promise;
    };
    // Lösche Eintrag
    this.delete = function (id) {
      var deferred = $q.defer(),
          index,
          i = 0;
      // Suche Genre
      for (i; i < dataService.music.length; i = i + 1) {
        // Falls gefunden - lösche und breche Schleife ab
        if (dataService.music[i].id === id) {
          index = i;
          dataService.music.splice(i, 1);
          break;
        }
      }
      // Falls Genre nicht gefunden, gibt Fehlercode 404 zurück
      $timeout(function () {
        if (index !== undefined) {
          deferred.resolve();
        } else {
          deferred.reject(404);
        }
      }, 200);

      return deferred.promise;
    };

    this.stats = function () {
      var result = {},
          // Erstelle deferred
          deferred = $q.defer();

      // Komplette Länge
      result.all = dataService.music.length;
      result.listened = 0;
      result.favorites = 0;

      angular.forEach(dataService.music, function (entry) {
        // Zähle gehörte Einträge
        if (entry.listened) {
          result.listened = result.listened + 1;
        }
        // Zähle Favoriten
        if (entry.favorite) {
          result.favorites = result.favorites + 1;
        }
      });

      // Löse Promise erfolgreich nach 0,5s auf
      $timeout(function () {
        deferred.resolve(result);
      }, 500);

      // Gibt Promise zurück
      return deferred.promise;
    };

    this.getGenres = function () {
      var deferred = $q.defer(),
          // Kopie, um Ausgangsdaten nicht zu verändern
          genres = angular.copy(dataService.genres),
          music = dataService.music,
          j = 0,
          i = 0;

      // Bestimme Genre jedes Musikeintrags und zähle diese
      for (i; i < music.length; i = i + 1) {
        j = 0;
        for (j; j < genres.length; j = j + 1) {
          // Setze Standardanzahl 0
          if (genres[j].count === undefined) {
            genres[j].count = 0;
          }
          // Gehört Musikeintrag zum aktuellen Genre
          if (music[i].genre === genres[j].alias) {
            // Erhöhe Anzahl
            genres[j].count = genres[j].count + 1;
            break;
          }
        }
      }
      $timeout(function () {
        // Kopier zur Referenzauflösung
        deferred.resolve(angular.copy(genres));
      }, 300);

      return deferred.promise;
    };

    // Lade ein Genre
    this.getOneGenre = function (alias) {
      var deferred = $q.defer(),
          genre,
          i = 0;
      // Suche Genre
      for (i; i < dataService.genres.length; i = i + 1) {
        // Falls gefunden - breche schleife ab
        if (dataService.genres[i].alias === alias) {
          genre = dataService.genres[i];
          break;
        }
      }
      // Falls Genre nicht gefunden, gibt Fehlercode 404 zurück
      $timeout(function () {
        if (genre) {
          // Erstelle Kopie, um Referenz aufzulösen
          deferred.resolve(angular.copy(genre));
        } else {
          deferred.reject(404);
        }
      }, 200);

      return deferred.promise;
    };
  }
])
.service('dataService', [
  function () {
    var startDate = 1441036000000;
    this.music = [
    {
      'cover': 'img/music/kiss_of_death.jpg',
      'creationDate': startDate - 10000,
      'title': 'Kiss of Death',
      'artist': 'Motörhead',
      'year': 2006,
      'favorite': true,
      'rating': 5,
      'listened': true,
      'genre': 'metal',
      'comment': 'Lemmy Kilmister!',
      'media': {
        'mp3': true,
        'lp': true,
        'cd': false
      },
      'id': 17
    }, {
      'cover': 'img/music/bad_magic.jpg',
      'creationDate': startDate - 5000,
      'title': 'Bad Magic',
      'artist': 'Motörhead',
      'year': 2015,
      'favorite': true,
      'rating': 5,
      'listened': true,
      'genre': 'metal',
      'comment': 'Das neuste Album von Motörhead!',
      'media': {
        'mp3': true,
        'lp': true,
        'cd': true
      },
      'id': 16
    }, {
      'cover': 'img/music/a_bit_of_devil.jpg',
      'creationDate': startDate - 30000,
      'title': 'A Bit of Devil',
      'artist': 'Zodiac',
      'year': 2012,
      'favorite': true,
      'rating': 5,
      'listened': true,
      'genre': 'rock',
      'comment': '',
      'media': {
        'mp3': true,
        'lp': true,
        'cd': false
      },
      'id': 15
    }, {
      'cover': 'img/music/a_hiding_place.jpg',
      'creationDate': startDate,
      'title': 'A Hiding Place',
      'artist': 'Zodiac',
      'year': 2013,
      'favorite': false,
      'rating': 4,
      'listened': true,
      'genre': 'rock',
      'comment': 'Das zweite Album der Münsteraner',
      'media': {
        'mp3': true,
        'lp': true,
        'cd': false
      },
      'id': 14
    }, {
      'cover': 'img/music/the_adventures_of.jpg',
      'creationDate': startDate - 2000,
      'title': 'The Adventures of',
      'artist': 'Thin Lizzy',
      'year': 1981,
      'favorite': false,
      'rating': 0,
      'listened': false,
      'genre': 'rock',
      'comment': 'Hit-Singles Collection',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': false
      },
      'id': 13
    }, {
      'cover': 'img/music/lovehunter.jpg',
      'creationDate': startDate - 50000,
      'title': 'Lovehunter',
      'artist': 'Whitesnake',
      'year': 1979,
      'favorite': false,
      'rating': 0,
      'listened': false,
      'genre': 'rock',
      'comment': 'Spanische Pressung',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': false
      },
      'id': 12
    }, {
      'cover': 'img/music/afterburner.jpg',
      'creationDate': startDate - 60000,
      'title': 'Afterburner',
      'artist': 'ZZ Top',
      'year': 1985,
      'favorite': false,
      'rating': 0,
      'listened': false,
      'genre': 'rock',
      'comment': 'Die Alt-Rocker',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': false
      },
      'id': 11
    }, {
      'cover': 'img/music/at_the_edge_of_time.jpg',
      'creationDate': startDate - 80000,
      'title': 'At The Edge Of Time',
      'artist': 'Blind Guardian',
      'year': 2010,
      'favorite': true,
      'rating': 5,
      'listened': true,
      'genre': 'metal',
      'comment': 'Vinyl ist mit Bildaufdruck',
      'media': {
        'mp3': true,
        'lp': true,
        'cd': false
      },
      'id': 0
    }, {
      'cover': 'img/music/lambert.jpg',
      'creationDate': startDate - 10000,
      'title': 'Lambert',
      'artist': 'Lambert',
      'year': 2014,
      'favorite': true,
      'rating': 5,
      'listened': true,
      'genre': 'klassik',
      'comment': 'Ein klasse Pianist!',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': true
      },
      'id': 1
    }, {
      'cover': 'img/music/star_wars.jpg',
      'creationDate': startDate - 10000,
      'title': 'Star Wars',
      'artist': 'London Philharmonic Orchestra',
      'year': 1977,
      'favorite': false,
      'rating': 0,
      'listened': false,
      'genre': 'klassik',
      'comment': '',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': false
      },
      'id': 2
    }, {
      'cover': 'img/music/rats_and_rumors.jpg',
      'creationDate': startDate - 25000,
      'title': 'Rats & Rumours',
      'artist': 'Nitrogods',
      'year': 2014,
      'favorite': true,
      'rating': 3,
      'listened': true,
      'genre': 'rock',
      'comment': '',
      'media': {
        'mp3': true,
        'lp': true,
        'cd': true
      },
      'id': 3
    }, {
      'cover': 'img/music/phil_collins.jpg',
      'creationDate': startDate - 50000,
      'title': 'Phil Collins',
      'artist': 'Phil Collins',
      'year': 1984,
      'favorite': false,
      'rating': 0,
      'listened': false,
      'genre': 'pop',
      'comment': '',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': false
      },
      'id': 4
    }, {
      'cover': 'img/music/harvest.jpg',
      'creationDate': startDate - 100000,
      'title': 'Harvest',
      'artist': 'Neil Young',
      'year': 1972,
      'favorite': true,
      'rating': 5,
      'listened': true,
      'genre': 'blues',
      'comment': 'Heart of Gold... Heart of Gold!',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': false
      },
      'id': 5
    }, {
      'cover': 'img/music/infinity.jpg',
      'creationDate': startDate - 3000,
      'title': 'Infinity',
      'artist': 'Journey',
      'year': 1978,
      'favorite': true,
      'rating': 4,
      'listened': true,
      'genre': 'rock',
      'comment': '',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': false
      },
      'id': 6
    }, {
      'cover': 'img/music/juggernaut_of_justice.jpg',
      'creationDate': startDate - 5000,
      'title': 'Juggernaut Of Justice',
      'artist': 'Anvil',
      'year': 2011,
      'favorite': false,
      'rating': 4,
      'listened': true,
      'genre': 'metal',
      'comment': '',
      'media': {
        'mp3': true,
        'lp': true,
        'cd': false
      },
      'id': 7
    }, {
      'cover': 'img/music/the_freewheelin.jpg',
      'creationDate': startDate - 2000,
      'title': 'The Freewheelin\'',
      'artist': 'Bob Dylan',
      'year': 1963,
      'favorite': false,
      'rating': 0,
      'listened': false,
      'genre': 'blues',
      'comment': 'Vinyl von 1975',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': false
      },
      'id': 8
    }, {
      'cover': 'img/music/asia.jpg',
      'creationDate': startDate - 1000,
      'title': 'asia',
      'artist': 'Asia',
      'year': 1982,
      'favorite': true,
      'rating': 5,
      'listened': true,
      'genre': 'rock',
      'comment': '',
      'media': {
        'mp3': false,
        'lp': true,
        'cd': true
      },
      'id': 9
    }, {
      'cover': 'img/music/mondays_ghost.jpg',
      'creationDate': startDate - 100,
      'title': 'Monday\'s Ghost',
      'artist': 'Sophie Hunger',
      'year': 2008,
      'favorite': false,
      'rating': 0,
      'listened': false,
      'genre': 'indie',
      'comment': '',
      'media': {
        'mp3': true,
        'lp': true,
        'cd': true
      },
      'id': 18
    }, {
      'cover': 'img/music/powerdose.jpg',
      'creationDate': startDate - 1000,
      'title': 'Powerdose',
      'artist': 'Speedtrap',
      'year': 2013,
      'favorite': true,
      'rating': 5,
      'listened': true,
      'genre': 'rock',
      'comment': 'Voll auf die Zwölf!',
      'media': {
        'mp3': true,
        'lp': true,
        'cd': false
      }
      ,
      'id': 10
    }];

    this.genres = [{
      alias: 'rock',
      label: 'Rock'
    }, {
      alias: 'metal',
      label: 'Metal'
    }, {
      alias: 'pop',
      label: 'Pop'
    }, {
      alias: 'jazz',
      label: 'Jazz'
    }, {
      alias: 'blues',
      label: 'Blues'
    }, {
      alias: 'punk',
      label: 'Punk'
    }, {
      alias: 'ndw',
      label: 'Neue Deutsche Welle'
    }, {
      alias: 'indie',
      label: 'Indie'
    }, {
      alias: 'schlager',
      label: 'Schlager'
    }, {
      alias: 'klassik',
      label: 'Klassik'
    }];

    this.pages = [{
      alias: 'impress',
      title: 'Impressum',
      text: '<h1>HTML Ipsum Presents</h1>\
            <p><strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. <a href="#">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.</p>\
            <h2>Header Level 2</h2>\
            <ol>\
               <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>\
               <li>Aliquam tincidunt mauris eu risus.</li>\
            </ol>\
            <blockquote><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.</p></blockquote>\
            <h3>Header Level 3</h3>\
            <ul>\
               <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>\
               <li>Aliquam tincidunt mauris eu risus.</li>\
            </ul>'
    }, {
      alias: 'security',
      title: 'Datenschutz',
      text: '<h1>HTML Ipsum Presents</h1>\
            <p><strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. <a href="#">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.</p>\
            <h2>Header Level 2</h2>\
            <ol>\
               <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>\
               <li>Aliquam tincidunt mauris eu risus.</li>\
            </ol>\
            <blockquote><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.</p></blockquote>\
            <h3>Header Level 3</h3>\
            <ul>\
               <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>\
               <li>Aliquam tincidunt mauris eu risus.</li>\
            </ul>'
    }];
  }
]);
