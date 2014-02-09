var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if ( 'webkitSpeechRecognition' in window || 'speechRecognition' in window ) {
  var recognition;
  if ( window.speechRecognition ) {
    recognition = new speechRecognition();
  } else if ( window.webkitSpeechRecognition ) {
    recognition = new webkitSpeechRecognition();
  }
  recognition.continuous = true;
  recognition.interimResults = true;

  var has_seen_intro = false;

  recognition.onstart = function() {
    recognizing = true;
    if ( ! has_seen_intro) {
      _.delay(function() {
        $("#voice-intro").addClass("showing");
      }, 500);
      has_seen_intro = true;
    }
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    if (!final_transcript) {
      return;
    }
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    if (typeof(event.results) == 'undefined') {
      recognition.onend = null;
      recognition.stop();
      upgrade();
      return;
    }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    console.log("Voice: ", interim_transcript);
    if (interim_transcript.match(/go.+travel/)) {
      $(".nav-travel").trigger("click");
      $("#voice-intro").removeClass("showing");
    } else if (interim_transcript.match(/go.+code/)) {
      $(".nav-code").trigger("click");
      $("#voice-intro").removeClass("showing");
    } else if (interim_transcript.match(/go.+(home|top)/)) {
      $(".site-title a").trigger("click");
      $("#voice-intro").removeClass("showing");
    } else if (interim_transcript.match(/close|clothes/)) {
      $("#voice-intro").removeClass("showing");
    } else if (interim_transcript.match(/show|open/)) {
      $("#voice-intro").addClass("showing");
    }
    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
  };
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function stopButton() {
  if (recognizing) {
    recognizing = false;
    recognition.stop();
  }
}

function toggleIcon(event) {
  var icon = event.target.tagName==="I" && event.target;
  if ( ! icon) {
    icon = event.target.childNodes[0];
  }
  var icon_on = icon.getAttribute("data-on");
  if (icon_on === null) {
    icon.setAttribute("data-on", icon.className);
  }
  var icon_off = icon.getAttribute("data-off");
  if (icon.className === icon_off) {
    icon.className = icon_on;
  } else {
    icon.className = icon_off;
  }
}

function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = "en-US";
  recognition.start();
  ignore_onend = false;
  start_timestamp = (event && event.timestamp) || new Date();
}
