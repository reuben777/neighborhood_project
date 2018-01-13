var gmap;
var panorama;
var openStreetView;
var toggleStreetView;
var mapErrorHandler;

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
    var location = {lat: marker.lat, lng: marker.lng};
    var dynamic_icon = createMarkerCustomColor(marker.icon_settings);
    return new google.maps.Marker({
        position: location,
        title: marker.caption,
        icon: dynamic_icon,
        map: gmap
    });
}

// used to prevent redundancy
function updateModalInfo (caption, excerpt, colour) {
  AppViewModel.modal_caption(caption);
  AppViewModel.modal_excerpt(excerpt);
  AppViewModel.modal_text_colour("#" + colour);
}


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

        // gmap actually initialized here
        gmap = new google.maps.Map(document.getElementById('map'), map_params);

        // setup markers by looping through locations
        AppViewModel.locations.forEach(function(marker_info, indx) {
            // add marker
            AppViewModel.locations[indx].marker = addMarker(marker_info, indx);
            // listen events for marker click event
            this.addListener = google.maps.event.addListener(marker_info.marker,'click', function() {
              AppViewModel.itemSelected(marker_info);
            });
        });
    }
}

mapErrorHandler = function() {
  AppViewModel.mapLoaded(false);
};
