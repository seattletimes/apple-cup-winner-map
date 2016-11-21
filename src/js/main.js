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

  // var request = $.ajax({
  //   url: SERVICE,
  //   dataType: "jsonp",
  //   data: {
  //     name: "Thomas Wilburn",
  //     method: "setPin",
  //     lat: coords.lat,
  //     lng: coords.lng
  //   }
  // });

  // request.then(function(data) {
  //   console.log(data);
  // });
};

["touchstart", "mousedown"].forEach(event => pin.addEventListener(event, startDrag));

document.querySelector(".find-me").addEventListener("click", function(e) {
  gps(function(err, coords) {
    if (err) return console.log(err);
    placePin(coords);
  });
});