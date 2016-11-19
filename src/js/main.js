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

var cancel = e => {
  e.preventDefault();
  e.stopPropagation();
};

mapElement.addEventListener("dragenter", cancel);
mapElement.addEventListener("dragover", cancel);
mapElement.addEventListener("drop", function(e) {
  e.preventDefault();
  e.stopPropagation();
  var coords = map.mouseEventToLatLng(e);
  var marker = L.circleMarker(coords);
  marker.addTo(map);

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
    console.log(data);
  })
});