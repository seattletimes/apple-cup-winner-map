// -- handler.gs --

Logger.log("handler.gs loaded");

var testObject = {
  name: "Thomas",
  location: "Seattle, WA",
  method: "setPin"
};

function doGet(e) {
  var params = e && e.parameter.method ? e.parameter : testObject;
  var m = params.method || "setPin";
  params.timestamp = Date.now();
  var result = dispatchRoute(m, params);
  var json = JSON.stringify(result);
  var callback = params.callback || "callback";
  var out = ContentService.createTextOutput();
  out.setContent(callback + "(" + json + ");");
  out.setMimeType(ContentService.MimeType.JAVASCRIPT);
  return out;
}

// -- pin.gs --

Logger.log("registering route");
registerRoute("setPin", function(data) {
  appendRow(data);
  return { success: true };
});

// -- router.gs --

var routes;

function registerRoute(methodName, callback) {
  if (!routes) routes = {};
  routes[methodName] = callback;
}

function dispatchRoute(methodName, data) {
  var handler = routes[methodName] || function() {};
  return handler(data);
};

// -- sheetUtils.gs --

var SHEET_ID = "1FXse06Q4pPvh-eBNopWxIWeo1TLTjzApD9J6n221x0E";

var book = SpreadsheetApp.openById(SHEET_ID);
var sheet = book.getSheetByName("pins");
var header = sheet.getSheetValues(1, 1, 1, 100)[0];
var columnMap = {};
header.forEach(function(c, i) {
  if (c) columnMap[c] = i;
});

function appendRow(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  if (data instanceof Array) {
    sheet.appendRow(data);
  } else {
    var row = [];
    for (var k in data) {
      var index = columnMap[k];
      if (typeof index == "undefined") continue;
      row[index] = data[k];
    }
    sheet.appendRow(row);
  }
  lock.releaseLock();
}
