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
    self.title = title;
    self.lat = lat;
    self.lng = lng;
    self.icon_settings = icon_settings;
    self.marker = marker;
};

// user AppViewModel as a variable instead of a class so that certain values are accessible for the google maps api init
var AppViewModel = {
    locations: [
        new MarkerModel('Downsview Park', 43.741687, -79.480076, new IconSettings()),
        new MarkerModel('June Rowlands Park', 43.700440, -79.388438, new IconSettings('444444'))
    ]
};

// Activates knockout.js
ko.applyBindings(AppViewModel);