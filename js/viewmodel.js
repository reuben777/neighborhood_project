var colouredIcon = function(markerColor) {
    return 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + '|40|_|%E2%80%A2';
};

var urlIcon = function(url) {
    return url.length > 6 ? url : colouredIcon(url);
};

var IconSettings = function(url, size, origin, anchor, scaledSize) {
    var self = this;
    self.url = url || colouredIcon('ff0000');
    self.url = urlIcon(self.url);
    self.size = size || {x: 21, y: 34};
    self.origin = origin || {x: 0, y: 0};
    self.anchor = anchor || {x: 0, y: 0};
    self.scaledSize = scaledSize || {x: 21, y: 34};
};

var MarkerModel = function(title, lat, lng, icon_settings, marker) {
    var self = this;
    self.caption = title;
    self.lat = lat;
    self.lng = lng;
    self.icon_settings = icon_settings;
    self.marker = marker;
};

// https://stackoverflow.com/questions/23087721/call-a-function-on-enter-key-press
ko.bindingHandlers.executeOnEnter = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var callback = valueAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                callback.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

// user AppViewModel as a variable instead of a class so that certain values are accessible for the google maps api init
var AppViewModel = {
    locations: [
        new MarkerModel('Downsview Park', 43.741687, -79.480076, new IconSettings()),
        new MarkerModel('June Rowlands Park', 43.700440, -79.388438, new IconSettings('444444')),
        new MarkerModel('Ontario Science Centre', 43.716407, -79.339184, new IconSettings('c3a0be')),
        new MarkerModel('OLG Slots at Woodbine Racetrack', 43.715134, -79.604037, new IconSettings('http://maps.google.com/mapfiles/kml/shapes/horsebackriding.png')),
        new MarkerModel('Erindale Park', 43.547071, -79.654301, new IconSettings('eb5300')),
        new MarkerModel('CF Fairview Mall', 43.777745, -79.344774, new IconSettings('62d0bf')),
        new MarkerModel('Sky Zone Mississauga', 43.573680, -79.653523, new IconSettings('46ca09')),
        new MarkerModel('Budweiser Stage', 43.629246, -79.415239, new IconSettings('a54fbf')),
        new MarkerModel('Playdium Amusement Centre', 43.595452, -79.646930, new IconSettings('a93a44'))
    ],
    // ko observable for search input
    filter_input: ko.observable(''),
    // side navigation click function calls this to open street view
    itemSelected: function() {
      openStreetView(this.marker)
    },
    // observable for html hide and show if google maps fails to load
    mapLoaded: ko.observable(false)
};

AppViewModel.closeSideNav = function(){
  $('.location-side-nav-btn').sideNav('hide');
};

AppViewModel.filtered_search = ko.computed(function() {
  var self = this;
  var filter_query = this.filter_input().toLowerCase();
  var filtered_locations = ko.utils.arrayFilter(self.locations, function(location_info) {
    var caption = location_info.caption.toLowerCase();
    var query_present = caption.indexOf(filter_query) >= 0;
    if (location_info.marker) {
      location_info.marker.setVisible(query_present);
    }
    return query_present;
  });
  if (typeof toggleStreetView === "function") {
    // safe to use the function
    if (filtered_locations.length === 1) {
      openStreetView(filtered_locations[0].marker);
    } else if (filtered_locations.length == 0 || filtered_locations.length > 1) {
      toggleStreetView(false);
    }
  }
  return filtered_locations;
}, AppViewModel);

// Activates knockout.js
ko.applyBindings(AppViewModel);
