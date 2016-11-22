// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");
var $ = require("jquery");

var $body = $(document.body);

var gps = require("./lib/geolocation").gps;

const url = "https://script.google.com/macros/s/AKfycbzF0qL4TjsFx_r1pRJ9A8oNUxaZvalWFCiIpfRrHgyeFxPmc_lX/exec";

var mapElement = document.querySelector("leaflet-map");
var map = mapElement.map;
var L = mapElement.leaflet;

var main = document.querySelector("main.interactive");
var $pins = $(".pin");
var here = L.circleMarker([0, 0], {
  fillOpacity: .8,
  fillColor: "#333",
  color: "white",
  clickable: false
});
here.bindPopup("You are here");

var dragState = null;

var cancel = e => {
  e.preventDefault();
  e.stopPropagation();
}

$pins.on("dragstart", cancel);

var startDrag = function(e) {
  var pin = e.target;
  var bounds = pin.getBoundingClientRect();
  dragState = {
    x: bounds.left,
    y: bounds.top,
    width: bounds.width,
    height: bounds.height,
    pin: pin
  };

  pin.classList.add("grabbing");

  ["touchmove", "mousemove"].forEach(event => document.body.addEventListener(event, dragMove));
  ["touchend", "mouseup"].forEach(event => document.body.addEventListener(event, stopDrag));
};

var dragMove = function(e) {
  var isTouch = !!e.changedTouches;

  var x = isTouch ? e.changedTouches[0].clientX : e.clientX;
  var y = isTouch ? e.changedTouches[0].clientY : e.clientY;
  x -= dragState.x;
  y -= dragState.y;
  y -= isTouch ? dragState.height * 1.5 : dragState.height * 1;
  x -= dragState.width / 2;
  dragState.pin.style.transform = `translate(${x}px, ${y}px) scale(${isTouch ? 2 : 1})`;
};

var stopDrag = function(e) {

  dragState.pin.classList.remove("grabbing");
  dragState.pin.style.transform = "";
  ["touchmove", "mousemove"].forEach(event => document.body.removeEventListener(event, dragMove));
  ["touchend", "mouseup"].forEach(event => document.body.removeEventListener(event, stopDrag));

  var bounds = mapElement.getBoundingClientRect();
  var x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
  var y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
  if (x < bounds.left || x > bounds.left + bounds.width || y < bounds.top || y > bounds.top + bounds.height) {
    return;
  }

  var coords = e.changedTouches ? map.mouseEventToLatLng(e.changedTouches[0]) : map.mouseEventToLatLng(e);
  placePin(coords);

};

var placePin = function(coords) {
  here.setLatLng(coords);
  here.addTo(map);
  here.openPopup();
  here.bringToFront();
  map.setView(coords);

  var team = dragState.pin.getAttribute("team");

  $(".form-container .team-name").html(team == "UW" ? "Huskies" : "Cougars")

  var bounds = main.getBoundingClientRect();
  main.style.minHeight = bounds.height + "px";

  document.body.setAttribute("stage", "show-form");
  document.body.classList.add("animate-form");
  var reflow = document.body.offsetWidth;
  document.body.classList.remove("animate-form");

};

document.querySelector("button.submit-form").addEventListener("click", function(e) {
  e.preventDefault();
  e.stopImmediatePropagation();

  var form = document.querySelector(".form-container");

  var inputs = form.querySelectorAll("input, textarea");
  var data = {
    method: "setPin",
    team: dragState.pin.getAttribute("team")
  };
  inputs.forEach(el => data[el.id] = el.value || el.innerHTML);

  main.style.minHeight = "";
  form.innerHTML = "Submitting your story...";

  document.body.setAttribute("stage", "submitting-form");

  var coords = here.getLatLng();
  data.lat = coords.lat;
  data.lng = coords.lng;

  var request = $.ajax({ url, data, dataType: "jsonp" });

  request.then(function(data) {
    form.innerHTML = "Complete!";
    setTimeout(function() {
      document.body.setAttribute("stage", "completed-form");
    }, 3000);
  });
})

var cancelButton = document.querySelector("button.cancel-form");
cancelButton.addEventListener("click", function(e) {
  e.preventDefault();
  document.body.setAttribute("stage", "map");
});

$pins.on("touchstart mousedown", startDrag);

document.querySelector(".find-me").addEventListener("click", function(e) {
  gps(function(err, coords) {
    if (err) return console.log(err);
    map.setView(coords, 15);
  });
});

var waBounds = [[49.155, -125.06], [45.55, -116.45]];
map.fitBounds(waBounds);

window.pins.forEach(function(row) {
  var size = 14;
  var marker = L.marker([row.lat, row.lng], {
    icon: L.divIcon({
      className: "story-pin " + row.team,
      iconSize: [size, size],
      html: row.featured ? "&bigstar;" : ""
    }),
    zIndexOffset: row.featured ? 1000 : 1
  });
  row.fan_years = row.fan_years || 1;
  marker.addTo(map);
  marker.bindPopup(`
<div class="story">
  <h1>${row.name}</h1>
  <ul class="stats">
    <li> Favorite player: ${row.player || "nobody"}
    <li> Fan for ${row.fan_years == 1 ? row.fan_years + " year" : row.fan_years + " year"}
  </ul>
  <div class="story">
  ${row.story || ""}
  </div>
</div>
  `)
})