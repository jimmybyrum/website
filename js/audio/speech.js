(function() {
  var speechRecognition = window.SpeechRecognition ||
                          window.webkitSpeechRecognition ||
                          window.mozSpeechRecognition ||
                          window.oSpeechRecognition ||
                          window.msSpeechRecognition;
  var recognition;
  var final_transcript = '';
  var recognizing = false;
  var lang = "en-US";

  window.SPEECH = {
    onStart: function() {},
    onStop: function() {},
    onResult: function() {},

    isCapable: function() {
      return recognition !== undefined;
    },

    stop: function() {
      if (recognizing) {
        recognizing = false;
        recognition.stop();
      }
    },

    start: function(event) {
      if (recognizing) {
        recognition.stop();
        return;
      }
      final_transcript = '';
      recognition.lang = lang;
      recognition.start();
    }
  };

  if (speechRecognition) {
    recognition = new speechRecognition()
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
      recognizing = true;
      SPEECH.onStart();
    };

    recognition.onerror = function(event) {
      SPEECH.onStop();
    };

    recognition.onend = function() {
      recognizing = false;
      SPEECH.onStop();
    };

    recognition.onresult = function(event) {
      var interim_transcript = '';
      if (typeof(event.results) == 'undefined') {
        recognition.onend = null;
        recognition.stop();
        // upgrade();
        return;
      }
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      SPEECH.onResult(interim_transcript);

    };
  }
}());
