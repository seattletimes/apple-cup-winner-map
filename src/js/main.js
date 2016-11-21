// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");
var $ = require("jquery");

var gps = require("./lib/geolocation").gps;

const SERVICE = "https://script.google.com/macros/s/AKfycbzF0qL4TjsFx_r1pRJ9A8oNUxaZvalWFCiIpfRrHgyeFxPmc_lX/exec";

var mapElement = document.querySelector("leaflet-map");
var map = mapElement.map;
var L = mapElement.leaflet;

var pin = document.querySelector(".pin");
var here = L.circleMarker();

var dragState = null;

var cancel = e => {
  e.preventDefault();
  e.stopPropagation();
}

pin.addEventListener("dragstart", cancel);

var startDrag = function(e) {
  var bounds = pin.getBoundingClientRect();
  dragState = {
    x: bounds.left,
    y: bounds.top,
    width: bounds.width,
    height: bounds.height
  };

  pin.classList.add("grabbing");

  ["touchmove", "mousemove"].forEach(event => document.body.addEventListener(event, dragMove));
  ["touchend", "mouseup"].forEach(event => document.body.addEventListener(event, stopDrag));
};

var dragMove = function(e) {
  var x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
  var y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
  x -= dragState.x;
  y -= dragState.y;
  y -= dragState.height * 1.5;
  x -= dragState.width / 2;
  pin.style.transform = `translate(${x}px, ${y}px) scale(2)`;
};

var stopDrag = function(e) {

  pin.classList.remove("grabbing");
  pin.style.transform = "";
  ["touchmove", "mousemove"].forEach(event => document.body.removeEventListener(event, dragMove));
  ["touchend", "mouseup"].forEach(event => document.body.removeEventListener(event, stopDrag));

  var coords = e.changedTouches ? map.mouseEventToLatLng(e.changedTouches[0]) : map.mouseEventToLatLng(e);
  placePin(coords);

};

var placePin = function(coords) {
  here.setLatLng(coords);
  here.addTo(map);
  map.setView(coords);

  document.body.setAttribute("stage", "show-form");
  document.body.classList.add("animate-form");
  var reflow = document.body.offsetWidth;
  document.body.classList.remove("animate-form");

};

document.querySelector("button.submit-form").addEventListener("click", function(e) {
  e.preventDefault();
  e.stopImmediatePropagation();

  var form = document.querySelector(".form-container");

  form.innerHTML = "Submitting your story...";

  document.body.setAttribute("stage", "submitting-form");

  var coords = here.getLatLng();

  var request = $.ajax({
    url: SERVICE,
    dataType: "jsonp",
    data: {
      name: "Thomas Wilburn",
      method: "setPin",
      lat: coords.lat,
      lng: coords.lng
    }
  });

  request.then(function(data) {
    form.innerHTML = "Complete!";
    setTimeout(function() {
      document.body.setAttribute("stage", "completed-form");
    }, 5000);
  });
})

document.querySelector("button.cancel-form").addEventListener("click", () => document.body.classList.remove("show-form"));

["touchstart", "mousedown"].forEach(event => pin.addEventListener(event, startDrag));

document.querySelector(".find-me").addEventListener("click", function(e) {
  gps(function(err, coords) {
    if (err) return console.log(err);
    placePin({ lat: coords[0], lng: coords[1] });
  });
});