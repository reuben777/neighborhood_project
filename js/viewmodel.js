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
        new MarkerModel('Playdium Amusement Centre', 43.595452, -79.646930, new IconSettings('123456'))
    ],

    filter_input: ko.observable('')
};

AppViewModel.closeSideNav = function(){
  $('.location-side-nav-btn').sideNav('hide');
  console.log('test');
};

AppViewModel.filtered_search = ko.computed(function() {
  var self = this;
  var filter_query = this.filter_input().toLowerCase();
  return ko.utils.arrayFilter(self.locations, function(location_info) {
    var caption = location_info.caption.toLowerCase();
    var query_present = caption.indexOf(filter_query) >= 0;
    if (location_info.marker) {
      location_info.marker.setVisible(query_present);
    }
    return query_present;
  });
}, AppViewModel);

// Activates knockout.js
ko.applyBindings(AppViewModel);
