$(document).ready(function() {
    var $window = $(window);
    var window_height;

    var hi_res = window.devicePixelRatio && window.devicePixelRatio>1;
    var narrow = window.innerWidth && window.innerWidth<768;

    var $travel = $("#travel");
    var travel_position = 0;
    var $code = $("#code");
    var code_position = 0;

    var $html = $("html");

    var $header = $(".header");
    var header_height = $header.innerHeight();

    var $title = $(".site-title");
    var title_top = $title.position().top;

    var $navigation = $(".navigation");

    _.delay(function() {
        $html.removeClass("start");
    }, 1000);

    var onScroll = function(e) {
        var scroll_top = $window.scrollTop();

        if (scroll_top >= title_top) {
            if ( ! $title.hasClass("fixed")) {
                $title.removeClass("transition");
                $title.addClass("fixed");
            }
        } else if (scroll_top < 10) {
            $title.addClass("transition");
            $title.removeClass("fixed");
        }

        if (scroll_top >= code_position - 50) {
            $html.removeClass("section-top section-travel");
            $html.addClass("section-code");
        } else if (scroll_top >= travel_position - 50) {
            $html.removeClass("section-top section-code");
            $html.addClass("section-travel");
            placePins();
        } else if (scroll_top < window_height) {
            $html.removeClass("section-travel section-code");
            $html.addClass("section-top");
        }
    };
    onScroll = _.throttle(onScroll, 50);
    $window.on("scroll", onScroll);

    var didInit = false;
    var onResize = function() {
        $html.addClass("disable-scrolling");
        window_height = $window.height();
        if (narrow) {
            var mobile_height = window_height - header_height;
            $(".match-parent.vertical").css("min-height", (mobile_height - 50) + "px");
            $("#top, #top .match-parent.vertical").css("min-height", window_height + "px");
            $("#travel, #code").css("padding-top", header_height + "px");
        } else {
            $(".match-parent.vertical").css("min-height", window_height + "px");
        }
        _.delay(function() {
            travel_position = Math.round($travel.offset().top);
            code_position = Math.round($code.offset().top);
            // photos_position = Math.round($photos.offset().top);
            $html.removeClass("disable-scrolling");
            if ( ! didInit) {
                didInit = true;
                onScroll();
                $('.carousel').carousel();
            }
        }, 300);
    };
    onResize = _.throttle(onResize, 50);
    $window.on("resize", onResize);

    onResize();

    $(document).on("click", ".navigation a, .site-title a", function(e) {
        e.preventDefault();
        var $item = $(e.target);
        var name = $item.attr("href");
        var $target = $(name);
        $.scrollTo($target, 300, {easing: "swing"});
        $html.addClass("goto-" + name.substring(1));
        _.delay(function() {
            $html.removeClass("goto-" + name.substring(1));
        }, 600);
        $("#carousel-example-generic").carousel("pause");
    });

    $(document).on("click", ".glyphicon-remove-sign", function(e) {
        $(e.target).parent().removeClass("showing");
    });

    $(document).on("keypress", function(e) {
        if (e.keyCode === 63) {
            $("#help").addClass("showing");
        } else if (e.keyCode === 27) {
            $(".dialog").removeClass("showing");
        }
    });

    var map, locations = [], li = 0, pins_placed = false, infowindows = [];
    var placePin = function(location) {
        var lat = location.coords[0];
        var lon = location.coords[1];
        var iw_content = location.name;
        if (location.photos) {
            var flickr = location.photos.split(",");
            var f, fl = flickr.length;
            for (f = 0; f < fl; f++) {
                iw_content += '<br><a target="_blank" href="'+flickr[f]+'">Photos</a>';
            }
        }
        if (location.date) {
            iw_content += "<br>"+location.date;
        }
        var infowindow = new google.maps.InfoWindow({
            content: iw_content
        });
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: map,
            icon: "/images/pin.png",
            title: location.name
            // animation: google.maps.Animation.DROP
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
            infowindows.push(infowindow);
        });
        _.delay(placeNextPin, 10);
    };
    var placeNextPin = function() {
        var location = locations[li];
        if (location) {
            placePin(location);
            li++;
        }
    };
    var placePins = function() {
        if ( ! pins_placed) {
            pins_placed = true;
            var continent, country;
            for (continent in places_data) {
                for (country in places_data[continent]) {
                    var locs = places_data[continent][country];
                    var c, cl = locs.length;
                    for (c = 0; c < cl; c++) {
                        locs[c].epoch = new Date(locs[c].date);
                        locations.push(locs[c]);
                    }
                }
            }
            locations.sort(function(a, b) {
                return a.epoch - b.epoch;
            });
            placeNextPin();
        }
    };
    function initialize() {
        var mapOptions = {
            center: new google.maps.LatLng(18, 0),
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            streetViewControl: false,
            panControl: false,
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_CENTER,
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            scaleControl: true,
            scrollwheel: false
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        google.maps.event.addListener(map, 'click', function() {
            console.warn(123);
            var i, il = infowindows.length;
            for (i = 0; i < il; i++) {
                var infowindow = infowindows.pop();
                infowindow.close();
            }
        });
    }
    google.maps.event.addDomListener(window, 'load', initialize);

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");

    var $voice = $("#voice-toggle");
    $voice.on('click', function(e) {
        e.preventDefault();
        $voice.toggleClass("voice-on");
        if ($voice.hasClass("voice-on")) {
            $voice.find(".status").text("on");
            startButton();
        } else {
            $voice.find(".status").text("off");
            stopButton();
        }
    });

    if (narrow) {
        placePins();
    }
});
