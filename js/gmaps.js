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
        // gmap actually initialized here
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

        // setup markers by looping through locations
        AppViewModel.locations.forEach(function(marker_info, indx) {
            // add marker
            AppViewModel.locations[indx].marker = addMarker(marker_info, indx);
            // listen events for marker click event
            this.addListener = google.maps.event.addListener(marker_info.marker,'click', function() {
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
