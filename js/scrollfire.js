(function($) {

  var scrollFireEventsHandled = false;

  // Input: Array of JSON objects {selector, offset, callback}
  Materialize.scrollFireEnhanced = function(options) {
    var onScroll = function() {
      for (var windowScroll = window.pageYOffset + window.innerHeight, c = 0; c < options.length; c++) {
        // Get options from each line
        var value = options[c];
        var selector = value.selector,
                  offset = value.offset,
                  downcallback = value.downScrollCallback,
                  upcallback = value.upScrollCallback;
                  currentElement = document.querySelector(selector);

        if ( currentElement !== null) {
                var elementOffset = currentElement.getBoundingClientRect().top + window.pageYOffset;

                if (windowScroll > (elementOffset + offset)) {
                  if (value.done != true) {
                    downcallback();
                    console.log("down " + windowScroll);
                    value.done = true;
                  }
                } else if(windowScroll < (elementOffset + offset) && value.done) {
                    upcallback();
                    console.log("up " + windowScroll);
                    value.done = false;
                }
              }

      }
    };


    var throttledScroll = Materialize.throttle(function() {
      onScroll();
    }, options.throttle || 100);

    if (!scrollFireEventsHandled) {
      window.addEventListener("scroll", throttledScroll);
      window.addEventListener("resize", throttledScroll);
      scrollFireEventsHandled = true;
    }

    // perform a scan once, after current execution context, and after dom is ready
    setTimeout(throttledScroll, 0);
  };

})(jQuery);
