$(document).ready(function() {

  var $window = $(window);
  var window_height = $window.height();
  var hi_res = window.devicePixelRatio && window.devicePixelRatio>1;
  var narrow = window.innerWidth && window.innerWidth<768;

  var $html = $('html');

  var $header = $('.header');
  var header_height = $header.innerHeight();
  var $title = $('.site-title');
  var title_top = Math.round($title.position().top);

  var $navigation = $('.navigation');

  var current_section = 'section-top';

  var $carousel = $('#carousel-example-generic');
  var carousel_items = $carousel.find('.item').size();
  var random = Math.floor(Math.random() * carousel_items);
  $carousel.find('.item').removeClass('active');
  $carousel.find('.item').eq(random).addClass('active');

  var $travel = $('#travel');
  var $code = $('#code');
  // where in the page are these? distance from the top
  // will be set below.
  var travel_position = Math.round($travel.offset().top);
  var code_position = Math.round($code.offset().top);

  var $year = $('#map-year span');
  var $years = $('#map-years');
  var $years_ = $('#map-years .underline');

  var $help = $('#help');

  var $footer = $('footer');
  var footer_position = 0;

  // a bunch of bits are hidden on start. once we've reached
  // this point in the code, we're good to start showing stuff
  // to the user, so remove the start class
  $html.removeClass('start');

  // photos carousel
  var startCarousel = function() {
    $('.carousel').carousel();
    $('.carousel-inner').swipe( {
      swipeLeft:function(event, direction, distance, duration, fingerCount) {
        $(this).parent().carousel('next');
      },
      swipeRight: function() {
        $(this).parent().carousel('prev');
      },
      threshold: 30
    });
  };
  var pauseCarousel = function() {
    $('.carousel').carousel('pause');
  };
  var openCurrentPhoto = function() {
    var $link = $('.item.active .carousel-caption a');
    $link.get(0).click();
  };

  // handle ui tweaks on scroll- mostly through changing class names
  var onScroll = function(e) {
    var scroll_top = $window.scrollTop();

    if (scroll_top >= title_top) {
      if (!$title.hasClass('fixed')) {
        $title.removeClass('transition');
        $title.addClass('fixed');
      }
    } else if (scroll_top < 10) {
      $title.addClass('transition');
      $title.removeClass('fixed');
    }

    if (scroll_top >= footer_position) {
      setCurrentSection('section-footer');
    } else if (scroll_top >= code_position - 50) {
      setCurrentSection('section-code');
    } else if (scroll_top >= travel_position - 50) {
      setCurrentSection('section-travel');
      placePins();
    } else if (scroll_top < window_height) {
      setCurrentSection('section-top');
    }

    pauseCarousel();
  };
  onScroll = _.throttle(onScroll, 50);
  $window.on('scroll', onScroll);

  // on init, and resize, set a bunch of vars for proper scrolling
  // and heights (each section except the footer should at leats fill
  // the viewport).
  var setCodeHeight = function() {
    var $scrollbar = $('.ace_scrollbar');
    if ($scrollbar.size() === 1) {
      var code_height = $scrollbar.get(0).scrollHeight;
      $('.editor-cx').height(code_height+'px');
      editor.resize();
    } else {
      _.delay(setCodeHeight, 300);
    }
  };
  var start_section;
  if (window.location.hash && window.location.hash !== '#') {
    start_section = window.location.hash.substring(1);
  }
  var didInit = false;
  var onResize = function() {
    var diff = Math.abs($window.height() - window_height);
    var do_resize = !Modernizr.touch || diff > 100;
    if (!didInit || do_resize) {
      $html.addClass('disable-scrolling');
      window_height = $window.height();
      if (narrow) {
        var mobile_height = window_height - header_height;
        $('#top, #top .match-parent.vertical').css('min-height', window_height + 'px');
        $('#travel, #travel .match-parent.vertical').css('min-height', (window_height - 25) + 'px');
        $('#code, #code .match-parent.vertical').css('min-height', mobile_height + 'px');
        $('#code').css('padding-top', header_height + 'px');
      } else {
        $('.match-parent.vertical').css('min-height', window_height + 'px');
      }
      _.delay(function() {
        setCodeHeight();
        travel_position = Math.round($travel.offset().top);
        code_position = Math.round($code.offset().top);
        footer_position = Math.round($footer.offset().top - (window_height - $footer.height()));
        $html.removeClass('disable-scrolling');
        if (!didInit) {
          didInit = true;
          onScroll();
          startCarousel();
          if (start_section) {
            gotoSection('section-' + start_section);
          }
        }
      }, 300);
    }
  };
  onResize = _.throttle(onResize, 50);
  $window.on('resize', onResize);

  // navigation
  var setCurrentSection = function(section) {
    $html.removeClass('section-top section-travel section-code section-footer');
    current_section = section;
    $html.addClass(current_section);
    setBrowserLocation(current_section);
  };
  var setBrowserLocation = _.debounce(function(section) {
    var hash = '#' + section.replace('section-', '');
    if (hash === '#top') {
      hash = window.location.pathname;
    }
    if (hash !== window.location.hash) {
      try {
        window.history.replaceState(hash, '', hash);
      } catch(e) {}
    }
  }, 300);
  var gotoSection = function(section) {
    if (section === 'section-top') {
      $('.nav-top').trigger('click');
    } else if (section === 'section-travel') {
      $('.nav-travel').trigger('click');
    } else if (section === 'section-code') {
      $('.nav-code').trigger('click');
    } else if (section === 'section-footer') {
      $.scrollTo($footer, 300, {easing: 'swing'});
      setBrowserLocation('footer');
    }
  };
  $(document).on('click', '.navigation a, .site-title a', function(e) {
    e.preventDefault();
    var $item = $(e.target);
    var name = $item.attr('href');
    var $target = $(name);
    $.scrollTo($target, 300, {easing: 'swing'});
    setBrowserLocation(name.substring(1));
    $html.addClass('goto-' + name.substring(1));
    _.delay(function() {
      $html.removeClass('goto-' + name.substring(1));
    }, 600);
    pauseCarousel();
  });

  // keyboard commands
  $(document).on('keydown', function(e) {
    if (e.keyCode === 191) {
      $help.addClass('showing');
    } else if (e.keyCode === 27) {
      $('.dialog').removeClass('showing');
    } else if (e.keyCode === 39 || e.keyCode === 76) {
      if ( $html.hasClass('section-top') ) {
        $carousel.carousel('next');
      } else if ( $html.hasClass('section-travel') ) {
        gotoYear(e, 'next');
      }
    } else if (e.keyCode === 37 || e.keyCode === 72) {
      if ( $html.hasClass('section-top') ) {
        $carousel.carousel('prev');
      } else if ( $html.hasClass('section-travel') ) {
        gotoYear(e, 'prev');
      }
    } else if (e.keyCode === 75) {
      if (current_section === 'section-footer') {
        gotoSection('section-code');
      } else if (current_section === 'section-code') {
        gotoSection('section-travel');
      } else if (current_section === 'section-travel') {
        gotoSection('section-top');
      }
    } else if (e.keyCode === 74) {
      if (current_section === 'section-top') {
        gotoSection('section-travel');
      } else if (current_section === 'section-travel') {
        gotoSection('section-code');
      } else if (current_section === 'section-code') {
        gotoSection('section-footer');
      }
    } else if (e.keyCode === 79) {
      openCurrentPhoto();
    }
  });

  // for modal dialogs (help and voice comamnds)
  $(document).on('click', '.glyphicon-remove-sign', function(e) {
    $(e.target).parent().removeClass('showing');
  });

  // map and pins
  var map,
    locations = [],
    locations_i = 0,
    pins_placed = false,
    placing = true,
    markers = [],
    infowindows = [];
  var placePin = function(location) {
    var lat = location.coords[0];
    var lon = location.coords[1];
    var iw_content = location.name;
    if (location.photos) {
      var flickr = location.photos.split(',');
      var f, fl = flickr.length;
      for (f = 0; f < fl; f++) {
        iw_content += '<br><a target="_blank" href="'+flickr[f]+'">Photos</a>';
      }
    }
    if (location.date) {
      iw_content += '<br>'+location.date;
      showYear(location.year);
    }
    var infowindow = new google.maps.InfoWindow({
      content: iw_content
    });
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lon),
      map: map,
      icon: '/images/pin.png',
      title: location.name,
      year: location.year,
      visible: placing
      // animation: google.maps.Animation.DROP
    });
    markers.push(marker);
    google.maps.event.addListener(marker, 'click', function() {
      hideAllInfowindows();
      infowindow.open(map, marker);
      infowindows.push(infowindow);
    });
    _.delay(placeNextPin, 10);
  };
  var placeNextPin = function() {
    var location = locations[locations_i];
    if (location) {
      placePin(location);
      locations_i++;
    }
  };
  var start_year = 1978;
  var end_year = new Date().getFullYear();
  var pins_by_year = {};
  var placePins = function() {
    if (!pins_placed && map) {
      pins_placed = true;
      var continent, country;
      for (continent in places_data) {
        for (country in places_data[continent]) {
          var locs = places_data[continent][country];
          var c, cl = locs.length;
          for (c = 0; c < cl; c++) {
            var date = new Date(locs[c].date);
            var year = date.getFullYear();
            if (!pins_by_year[year]) {
              pins_by_year[year] = 0;
            }
            locs[c].epoch = date;
            locs[c].year = year;
            pins_by_year[year]++;
            locations.push(locs[c]);
          }
        }
      }
      locations.sort(function(a, b) {
        return a.epoch - b.epoch;
      });
      for (var y = start_year; y <= end_year; y++) {
        var $item = $('<span/>');
        $item.addClass('muted year year-'+y);
        $item.data('year', y);
        if (pins_by_year[y]) { $item.addClass('has-travel'); }
        $item.text('\'' + y.toString().substring(2,4));
        $years.append($item);
      }
      placeNextPin();
    }
  };
  var previous_showing_years = [];
  var showing_years = [];
  var dragging = false;
  $(document).on('mousedown touchstart', '.year', function(e) {
    if (Modernizr.touch) {
      e.preventDefault();
    }
    placing = false;
    if (!dragging) {
      dragging = true;
      var $item = $(e.target);
      var year = $item.data('year');
      if (!e.shiftKey ) {
        resetYearsShowing();
      }
      addYearToShowing(year);
    }
  });
  $(document).on('mousemove touchmove', '.year', function(e) {
    e.preventDefault();
    if (dragging) {
      $html.addClass('dragging');
      var $item = $(e.target);
      try {
        var touches = e.originalEvent.changedTouches;
        var t = touches[(touches.length-1)];
        $item = $(document.elementFromPoint(t.clientX, t.clientY));
      } catch(e) {}
      var year = $item.data('year');
      if (year) {
        addYearToShowing(year);
        showYears();
        highlightYears();
      }
    }
  });
  $(document).on('mouseup touchend', function(e) {
    var oe = e.originalEvent;
    if (dragging) {
      dragging = false;
      if (showing_years.length === 0) {
        setAllYears();
      } else if (showing_years.length === 1 &&
             previous_showing_years.length === 1 &&
             _.intersection(showing_years, previous_showing_years).length === 1)
      {
        setAllYears();
      } else {
        var min = _.min(showing_years);
        var max = _.max(showing_years);
        resetYearsShowing();
        for (var i = min; i <= max; i++) {
          addYearToShowing(i);
        }
      }
      showYears();
      highlightYears();
    }
    $html.removeClass('dragging');
  });
  var resetYearsShowing = function() {
    previous_showing_years = showing_years;
    showing_years = [];
  };
  var addYearToShowing = function(year) {
    if (!_.contains(showing_years, year)) {
      showing_years.push(year);
    }
  };
  var setAllYears = function() {
    resetYearsShowing();
    for (var i = start_year; i <= end_year; i++) {
      showing_years.push(i);
    }
  };
  var showingAllYears = function() {
    return _.contains(showing_years, start_year) && _.contains(showing_years, end_year);
  };
  var gotoYear = function(e, direction) {
    placing = false;
    var new_year;
    if (direction === 'next') {
      if (showing_years.length === 0 || showingAllYears()) {
        new_year = start_year;
      } else {
        var year = _.max(showing_years);
        new_year = year + 1;
      }
    } else {
      if (showing_years.length === 0 || showingAllYears()) {
        new_year = end_year;
      } else {
        var year = _.min(showing_years);
        new_year = year - 1;
      }
    }
    if (new_year < start_year || new_year > end_year) {
      setAllYears();
    } else {
      if (!e.shiftKey) {
        resetYearsShowing();
      }
      showing_years.push(new_year);
    }
    showYears();
    highlightYears();
  };
  var highlightYears = function() {
    if ($years_.is(':visible')) {
      var start = _.min(showing_years);
      var $start = $('.year-' + start);
      var start_left = $start.position().left;
      $years_.css('left', start_left);
      if (showing_years.length > 1) {
        var end = _.max(showing_years);
        var $end = $('.year-' + end);
        var left = $end.position().left;
        var width = $end.innerWidth();
        var right = (left + width) - start_left;
        $years_.width(right);
      } else {
        $years_.width($start.innerWidth());
      }
    } else {
      $('.year').removeClass('is-showing');
      _.each(showing_years, function(y) {
        $('.year-' + y).addClass(('is-showing'));
      });
    }
  };
  var showYears = function() {
    var i, il = markers.length;
    var min = _.min(showing_years);
    var max = _.max(showing_years);
    for (i = 0; i < il; i++) {
      var marker = markers[i];
      var visible = marker.year >= min && marker.year <= max;
      marker.setVisible(visible);
    }
  };
  var showYear = function(year) {
    var $start = $('.year:first');
    var $end = $('.year-' + year);
    $end.removeClass('muted');
  };

  var hideAllInfowindows = function() {
    var i, il = infowindows.length;
    for (i = 0; i < il; i++) {
      var infowindow = infowindows.pop();
      infowindow.close();
    }
  };
  function initialize() {
    var mapOptions = {
      center: new google.maps.LatLng((narrow ? 60 : 18), 0),
      zoom: 2,
      minZoom: 2,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      streetViewControl: false,
      panControl: false,
      keyboardShortcuts: false,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      scaleControl: true,
      scrollwheel: false
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    google.maps.event.addListener(map, 'click', function() {
      hideAllInfowindows();
    });

    google.maps.event.addListenerOnce(map, 'idle', function(){
      var allowedBounds = map.getBounds();
      var lastValidCenter = map.getCenter();
      google.maps.event.addListener(map, 'center_changed', function() {
        var new_center = map.getCenter();
        if ( allowedBounds.contains(new_center) ) {
          lastValidCenter = map.getCenter();
          return;
        }
        // not valid anymore => return to last valid position
        map.panTo(lastValidCenter);
      });
    });

    // watching the pins being placed only really works well
    // on a big screen. For small screens, just get on with it.
    if (Modernizr.touch || current_section === 'section-travel') {
      placePins();
    }
  }
  google.maps.event.addDomListener(window, 'load', initialize);

  function formatDate(d) {
    if (typeof d.toLocaleDateString === 'function') {
      return d.toLocaleDateString();
    }
    if (typeof d.toDateString === 'function') {
      return d.toDateString();
    }
    return d.toString();
  }

  var resume = {
      name: 'James Byrum',
      experience: [{
        company:      'Vipps',
        url:          'https://www.vipps.no',
        location:     'Oslo, Norway',
        start_date:   formatDate(new Date('2018-08-06')),
        end_date:     undefined,
        job_title:    'Engineering Manager'
      }, {
        company:      'CreativeLive',
        url:          'https://www.creativelive.com',
        location:     'San Francisco, CA',
        start_date:   formatDate(new Date('2014-05-05')),
        end_date:     formatDate(new Date('2018-01-12')),
        job_title:    'Director of Engineering'
      }, {
        company:      'theBoardlist',
        url:          'https://theboardlist.com',
        location:     'San Francisco, CA',
        start_date:   formatDate(new Date('2015-09-01')),
        start_date:   formatDate(new Date('2018-01-29')),
        job_title:    'Principal Engineer'
      }, {
        company:      'Coin Ledger',
        url:          'https://coinledger.io',
        location:     'San Francisco, CA',
        start_date:   formatDate(new Date('2014-02-05')),
        end_date:     formatDate(new Date('2017-09-25')),
        job_title:    'Everything'
      }, {
        company:      'TalkTo',
        url:          'http://talkto.com',
        location:     'Cambridge, MA',
        start_date:   formatDate(new Date('2010-11-16')),
        end_date:     formatDate(new Date('2014-04-18')),
        job_title:    'Engineer'
      }, {
        company:      'WebMocha',
        url:          'http://webmocha.com',
        location:     'San Francisco, CA',
        start_date:   formatDate(new Date('2009-10-01')),
        end_date:     formatDate(new Date('2010-12-15')),
        job_title:    'Lead Web Developer'
      }, {
        job_title:    'Traveler',
        locations:    ['Antarctica', 'Andes Mountains',
               'Atacama Desert', 'Perú'],
        start_date:   formatDate(new Date('2008-12-12')),
        end_date:     formatDate(new Date('2009-09-30'))
      }, {
        organization: 'Ministerio de Educación de Chile',
        location:     'Porvenir, Chile',
        start_date:   formatDate(new Date('2008-07-01')),
        end_date:     formatDate(new Date('2008-12-10')),
        job_title:    'English Teacher'
      }, {
        company:      'Yahoo!',
        url:          'http://yahoo.com',
        locations:    [ 'Sunnvyvale, CA', 'London, UK' ],
        start_date:   formatDate(new Date('2004-05-01')),
        end_date:     formatDate(new Date('2008-06-30')),
        job_title:    'Frontend Engineer'
      }],
      patents: [{
        publication_number: 'US 8898157 B2',
        title: 'Systems and methods for providing search relevancy in communication initiation searches',
        url: 'https://www.google.com/patents/US8898157'
      }, {
        publication_number: 'US 9015155 B2',
        title: 'Multi-user communication system and method',
        url: 'https://www.google.com/patents/US9015155'
      }, {
        publication_number: 'US 20130268446 A1',
        title: 'System and method for entry of structured data',
        url: 'https://www.google.com/patents/US20130268446'
      }, {
        publication_number: 'US 20130066988 A1',
        title: 'System and method for establishing presence in a brokered chat system',
        url: 'https://www.google.com/patents/US20130066988'
      }],
      technologies: [
        'HTML5', 'CSS3', 'Javascript',
        'Node.js', 'hapi', 'Express',
        'Python', 'Django',
        'Nginx', 'Apache',
        'MongoDB', 'Redis', 'MySQL',
        'WebRTC', 'SIP',
        'Java', 'Arduino'
      ],
      libraries: [
        'Angular', 'Modernizr', 'Underscore',
        'Bootstrap', 'Handlebars', 'jQuery', 'Strophe', 'Vault'
      ],
      tools: [
        'Sublime Text', 'vi', 'Eclipse',
        'Photoshop', 'Sketch'
      ]
    };

  // resume is in an ace editor
  var editor = ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.getSession().setMode('ace/mode/javascript');
  // editor.getSession().setUseWrapMode(true);
  editor.setValue('let resume = ' + JSON.stringify(resume, null, 2));
  editor.gotoLine(1, 1);
  window.resume = resume;
  window.cv = resume;

  // voice commands
  var $voice = $('.voice-toggle');
  var $voice_intro = $('#voice-intro');
  var has_seen_intro = false;
  var closeVoice = function() {
    $voice_intro.removeClass('showing');
  };
  var showVoice = function() {
    $voice_intro.addClass('showing');
  };
  if (!SPEECH.isCapable()) {
    $voice.remove();
  } else {
    SPEECH.onStart = function() {
      if (!has_seen_intro) {
        _.delay(function() {
          $voice_intro.addClass('showing');
        }, 500);
        has_seen_intro = true;
      }
    };
    SPEECH.min_confidence = .2;
    SPEECH.addVoiceCommands([{
      command: 'travel',
      callback: function() {
        $('.nav-travel').trigger('click');
        closeVoice();
      }
    }, {
      command: 'code',
      callback: function() {
        $('.nav-code').trigger('click');
        closeVoice();
      }
    }, {
      command: 'home|top|photos|fotos',
      callback: function() {
        $('.site-title a').trigger('click');
        closeVoice();
      }
    }, {
      command: 'close|clothes',
      callback: function() {
        $('.dialog').removeClass('showing');
      }
    }, {
      command: 'show',
      callback: function() {
        showVoice();
      }
    }, {
      command: 'next',
      callback: function() {
        $carousel.carousel('pause');
        $carousel.carousel('next');
      }
    }, {
      command: 'previous|last|back',
      callback: function() {
        $carousel.carousel('pause');
        $carousel.carousel('prev');
      }
    }, {
      command: 'help',
      callback: function() {
        closeVoice();
        $help.addClass('showing');
      }
    }, {
      command: 'open',
      callback: function() {
        openCurrentPhoto();
      }
    }, {
      command: 'voice.+(off|stop)',
      callback: function() {
        $voice.trigger('click');
      }
    }]);

    function toggleVoice(force) {
      if (force) {
        if (force === 'on') {
          $voice.addClass('voice-on');
        } else {
          $voice.removeClass('voice-on');
        }
      } else {
        $voice.toggleClass('voice-on');
      }
      if ($voice.hasClass('voice-on')) {
        $voice.find('.status').text('on');
        SPEECH.start();
      } else {
        $voice.find('.status').text('off');
        SPEECH.stop();
      }
    }

    $(document).on('click', '.voice-toggle', function(e) {
      e.preventDefault();
      var $target = $(e.target);
      toggleVoice($target.data('voice'));
    });
  }

  if (!Modernizr.touch) {
    // no tooltips for touch devices.
    $('.footer a').tooltip();
  }

  onResize();
});
