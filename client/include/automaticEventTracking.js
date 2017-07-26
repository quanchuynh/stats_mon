var blur = 0;
var focus = 0;
var hidden = 0;
var visible = 0;

trackFocusState = function() {

  /* Use this to update global focusState. This is intended for tracking how much time user
     spending on site/page. Send heart-beat signal to server every x seconds unless focusState
     is false. Use listener to all events to time-out clock. */

  $(window).on("blur focus", function(e) {
    var prevType = $(this).data("prevType");
    if (prevType != e.type) {   //  reduce double fire issues
      switch (e.type) {
        case "blur":
          console.log("Blured " + blur++);
          focusState = false;
          break;
        case "focus":
          console.log("Focused " + focus++);
          focusState = true;
          break;
      }
    }
  });
}

getHiddenProp = function(){
  var prefixes = ['webkit','moz','ms','o'];
  // if 'hidden' is natively supported just return it
  if ('hidden' in document) return 'hidden';
  
  // otherwise loop over all the known prefixes until we find one
  for (var i = 0; i < prefixes.length; i++){
    if ((prefixes[i] + 'Hidden') in document) 
      return prefixes[i] + 'Hidden';
  }

  // otherwise it's not supported
  return null;
}


isHidden = function () {
  /*  
   *  Return true if the document is either minimized, on a background tab, the OS's lock screen is up, etc.
   *  Note that when the document is completely covered by another window, it's not hidden (caveat).
   *  This is intended for tracking how much time user spending on site/page. Send heart-beat signal to server 
   *  every x seconds unless isHidden() is false. This method is more preferreble over trackFocusState for situation
   *  where a user open 2 articles in 2 browser windows for comparison.
   */

  var prop = getHiddenProp();
  if (!prop) return false;
  return document[prop];
}


addVisibilityChangeListener = function() {
  // use the property name to generate the prefixed event name
  var visProp = getHiddenProp();
  if (visProp) {
    var evtname = visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
    console.log("Register event: " + evtname);
    document.addEventListener(evtname, visChange);
  }
}

visChange = function() {
  if (isHidden()) {
    console.log("Hidden " + hidden++);
    visibleState = false;
  }
  else {
    console.log("Visible " + visible++);
    visibleState = true;
  }
}

/* if you want to make sure that you take control of all events, you have to make sure that you 
 * override the addEventListener function before any event is registered.
 */

/*
var originalAdd = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(
                 event // A String that specifies the name of the event
                 , fn // function take event object
                 , useCapture // true - The event handler is executed in the capturing phase
                              // false- Default. The event handler is executed in the bubbling phase
              ) 
{
  this.originalAddEventListener = originalAdd;
  this.originalAddEventListener(event, function(evt) {
      target = evt.target;
      console.log("EVENT TARGET: " + target + 
                  ", tag name: " + target.tagName +
                  ", node name: " + target.nodeName +
                  ", ID: " + target.id +
                  ", URL: " + target.baseURI +
                  ", value: " + target.value + ", type: " + event);
      // We don't simply call fn(evt) since user's handler may use 'this' in it (e.g. SVGSVGElement). 
      // Bind 'this' to fn instead.
      fn.call(this, evt);

    }, // This our wrapper to real event handler
  useCapture);
};
*/

// NOTES: Does not capture all events (e.g. scrolling).
var originalScollHandler = window.onscroll; 
window.onscroll = function(e) {scollHandlerWrapper(e)};

/*
if(typeof someNode.onclick == "function") {
  // someNode has an event handler already set for the onclick event...
}
*/

function scollHandlerWrapper(evt) {
  // Need to handle all events which are not added by addEventListener()
  if (evt) {
      target = evt.target;
      console.log("Scroll EVENT TARGET: " + target + 
                  ", tag name: " + target.tagName +
                  ", node name: " + target.nodeName +
                  ", ID: " + target.id +
                  ", URL: " + target.baseURI +
                  ", value: " + target.value + ", type: " + 'scroll');
  } 
  else console.log("Scroll ...");
  if (originalScollHandler) {
    console.log("Found originalScollHandler");
    originalScollHandler(evt);
  }
}

/* $('*').on("click drag mouseout mouseover", */

/*
$('*').on("click", 
  // This register click, drag events for all elements. Would not work w/ scroll.
  function(e) {
    if (this === e.target) {
      // Handle only the element where click occurs (no propagation).
      console.log('You click: ' + e.target.id);
    }
  }
);
*/
