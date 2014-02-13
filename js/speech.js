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
  var commands = [];

  // now and debounce taken from underscore.js
  // by Jeremy Ashkenas http://underscorejs.org/
  var now = Date.now || function() { return new Date().getTime(); };
  var debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  var executeVoiceCommand = debounce(function(cmd) {
    cmd();
  }, 700, true);

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
    },

    min_confidence: .5,

    addVoiceCommand: function(c) {
      if (typeof c.command === "string") {
        c.command = new RegExp(c.command, "i");
      }
      c.min_confidence = c.min_confidence || this.min_confidence;
      commands.push(c);
    },

    addVoiceCommands: function(commands) {
      var c, cl = commands.length;
      for (c = 0; c < cl; c++) {
        this.addVoiceCommand(commands[c]);
      }
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
      var transcript = '';
      if ( ! event.results) {
        recognition.onend = null;
        recognition.stop();
        return;
      }
      var i, il = event.results.length;
      for (i = event.resultIndex; i < il; ++i) {
        var result = event.results[i];
        var confidence = result[0].confidence;
        if (result.isFinal) {
          transcript += result[0].transcript;
        } else {
          transcript += result[0].transcript;
        }
      }
      console.log(transcript, confidence);

      for (var c in commands) {
        var cmd = commands[c];
        if (transcript.match(cmd.command) && (confidence > cmd.min_confidence)) {
          executeVoiceCommand(cmd.callback);
        }
      }

      SPEECH.onResult(transcript);

    };
  }
}());
