var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if ( window.webkitSpeechRecognition || window.mozSpeechRecognition || window.speechRecognition ) {
  var recognition;
  if ( window.speechRecognition ) {
    recognition = new speechRecognition();
  } else if ( window.webkitSpeechRecognition ) {
    recognition = new webkitSpeechRecognition();
  } else if ( window.mozSpeechRecognition ) {
    recognition = new mozSpeechRecognition();
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
    if (interim_transcript.match(/travel/)) {
      executeVoiceCommand(function() {
        $(".nav-travel").trigger("click");
        closeVoice();
      });
    } else if (interim_transcript.match(/code/)) {
      executeVoiceCommand(function() {
        $(".nav-code").trigger("click");
        closeVoice();
      });
    } else if (interim_transcript.match(/home|top|photos|fotos/)) {
      executeVoiceCommand(function() {
        $(".site-title a").trigger("click");
        closeVoice();
      });
    } else if (interim_transcript.match(/close|clothes/)) {
      executeVoiceCommand(function() {
        $(".black-dialog").removeClass("showing");
      });
    } else if (interim_transcript.match(/show/)) {
      executeVoiceCommand(function() {
        showVoice();
      });
    } else if (interim_transcript.match(/next/)) {
      executeVoiceCommand(function() {
        $("#carousel-example-generic").carousel("pause");
        $("#carousel-example-generic").carousel("next");
      });
    } else if (interim_transcript.match(/previous|last|back/)) {
      executeVoiceCommand(function() {
        $("#carousel-example-generic").carousel("pause");
        $("#carousel-example-generic").carousel("prev");
      });
    } else if (interim_transcript.match(/help/)) {
      executeVoiceCommand(function() {
        closeVoice();
        $("#help").addClass("showing");
      });
    } else if (interim_transcript.match(/open/)) {
      executeVoiceCommand(function() {
        $(".item.active .carousel-caption a").trigger("click");
      });
    }
    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
  };
} else {
  $("#voice-toggle").remove();
}

var executeVoiceCommand = _.debounce(function(cmd) {
  cmd();
}, 700, true);

function closeVoice() {
  $("#voice-intro").removeClass("showing");
}
function showVoice() {
  $("#voice-intro").addClass("showing");
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
