var colouredIcon = function(markerColor) {
    return 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + '|40|_|%E2%80%A2';
};

var urlIcon = function(url) {
    return url.length > 6 ? url : colouredIcon(url);
};

// Icon Sertting helper function
var IconSettings = function(url, size, origin, anchor, scaledSize) {
    var self = this;
    self.url = urlIcon(url || colouredIcon('ff0000'));
    self.size = size || {x: 21, y: 34};
    self.origin = origin || {x: 0, y: 0};
    self.anchor = anchor || {x: 0, y: 0};
    self.scaledSize = scaledSize || {x: 21, y: 34};
};

// Marker Model creation helper function
var MarkerModel = function(title, lat, lng, icon_color, marker) {
    var self = this;
    self.caption = title;
    self.lat = lat;
    self.lng = lng;
    self.icon_settings = new IconSettings(icon_color);
    self.colour_scheme = '#000';
    if (icon_color && icon_color.length === 6) {
        self.colour_scheme = icon_color;
    }
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
        new MarkerModel('Downsview Park', 43.741687, -79.480076),
        new MarkerModel('June Rowlands Park', 43.700440, -79.388438, '444444'),
        new MarkerModel('Ontario Science Centre', 43.716407, -79.339184, 'c3a0be'),
        new MarkerModel('OLG Slots at Woodbine Racetrack', 43.715134, -79.604037, 'http://maps.google.com/mapfiles/kml/shapes/horsebackriding.png'),
        new MarkerModel('Erindale Park', 43.547071, -79.654301, 'eb5300'),
        new MarkerModel('CF Fairview Mall', 43.777745, -79.344774, '62d0bf'),
        new MarkerModel('Sky Zone Mississauga', 43.573680, -79.653523, '46ca09'),
        new MarkerModel('Budweiser Stage', 43.629246, -79.415239, 'a54fbf'),
        new MarkerModel('Playdium Amusement Centre', 43.595452, -79.646930, 'a93a44')
    ],
    // ko observable for search input
    filter_input: ko.observable(''),
    // model item_info
    modal_caption: ko.observable(''),
    modal_excerpt: ko.observable(''),
    modal_text_colour: ko.observable(''),
    // side navigation click function calls this to open street view
    itemSelected: function(marker_info) {
      // center marker when clicked
      gmap.panTo(marker_info.marker.getPosition());
      // set marker animation
      marker_info.marker.setAnimation(google.maps.Animation.BOUNCE);
      // remove/stop animation after specified time
      setTimeout(function() {
          marker_info.marker.setAnimation(null);
      }, 2100);
      updateModalInfo(marker_info.caption, "<p>Loading...</p>", marker_info.colour_scheme);
      // wiki ajax call to get article info on location
      $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          data: {titles: marker_info.caption, prop: "extracts", exlimit: 1},
          url: "http://en.wikipedia.org/w/api.php?action=query&format=json&callback=?"
      }).done(function(data) {
          var returned_article = data.query.pages[Object.keys(data.query.pages)[0]];
          // default modal info
          updateModalInfo(marker_info.caption, "<p>No results were found.</p>", marker_info.colour_scheme);
          if (returned_article.extract) {
            var extract_info = returned_article.extract;
            // update modal info with extract data
            updateModalInfo(marker_info.caption, extract_info, marker_info.colour_scheme);
          }
      }).fail(function(jqXHR, textStatus, errorThrown) {
          // ajax call failed.
          updateModalInfo(marker_info.caption, "<p>An Erro occured. Please check your internet connection and try again.</p>", marker_info.colour_scheme);
      });
      // when marker clicked open modal
      $('#item_info').modal('open');
    },
    // observable for html hide and show if google maps fails to load
    mapLoaded: ko.observable(false)
};

AppViewModel.closeSideNav = function(){
  $('.location-side-nav-btn').sideNav('hide');
};

// filters list of locations.
AppViewModel.filtered_search = ko.computed(function() {
  var self = this;
  var filter_query = this.filter_input().toLowerCase();
  var filtered_locations = ko.utils.arrayFilter(self.locations, function(location_info) {
    var caption = location_info.caption.toLowerCase();
    // if query is not found in caption
    var query_present = caption.indexOf(filter_query) >= 0;
    // if there is a marker. this is mainly due to function firing before gmaps.js has loaded
    if (location_info.marker) {
      location_info.marker.setVisible(query_present);
    }
    return query_present;
  });
  // this is mainly due to function firing before gmaps.js has loaded
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
