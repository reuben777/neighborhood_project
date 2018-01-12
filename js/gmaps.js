var gmap;
var panorama;
var openStreetView;
var toggleStreetView;
var mapErrorHandler;

function initMap() {
    // Used to check if google maps has been loaded
    // https://stackoverflow.com/questions/9228958/how-to-check-if-google-maps-api-is-loaded
    if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
        AppViewModel.mapLoaded(true);
        // initialize map
        var map_params = {
            center: {lat: 43.653226, lng: -79.383184},
            zoom: 11
        };

        gmap = new google.maps.Map(document.getElementById('map'), map_params);

        // see https://developers.google.com/maps/documentation/javascript/markers -> Converting MarkerImage objects to type Icon
        // and SVG path notation https://www.w3.org/TR/SVG/paths.html#PathData
        // http://blog.mridey.com/2010/03/using-markerimage-in-maps-javascript.html
        function createMarkerCustomColor(icon_settings) {
            return new google.maps.MarkerImage(
                icon_settings.url,
                new google.maps.Size(icon_settings.size.x, icon_settings.size.y),
                new google.maps.Point(icon_settings.origin.x, icon_settings.origin.y),
                new google.maps.Point(icon_settings.anchor.x, icon_settings.anchor.y),
                new google.maps.Size(icon_settings.scaledSize.x, icon_settings.scaledSize.y)
            );
        }

        // Adds a marker to the map.
        function addMarker(marker, indx) {
            // Add the marker at the clicked location, and add the next-available label
            // from the array of alphabetical characters.
            var location = {lat: marker.lat, lng: marker.lng};
            var dynamic_icon = createMarkerCustomColor(marker.icon_settings);
            return new google.maps.Marker({
                position: location,
                title: marker.caption,
                icon: dynamic_icon,
                map: gmap
            });
        }
        // setup markers
        AppViewModel.locations.forEach(function(marker_info, indx) {
            AppViewModel.locations[indx].marker = addMarker(marker_info, indx);
            this.addListener = google.maps.event.addListener(marker_info.marker,'click', function() {
                openStreetView(this);
            });
        });
        // set visibility of street view
        toggleStreetView = function (visible) {
          if (panorama) {
            if (visible == true) {
              panorama.setVisible(true);
            } else {
              panorama.setVisible(false);
            }
          }
        }
        // setup street view and show
        openStreetView = function (location) {
          panorama = gmap.getStreetView();
          panorama.setPosition(location.position);
          panorama.setPov(/** @type {google.maps.StreetViewPov} */({
            heading: 265,
            pitch: 0
          }));
          toggleStreetView(true);
        }
    }
}

mapErrorHandler = function() {
  AppViewModel.mapLoaded(false);
}
