mapboxgl.accessToken =
  "pk.eyJ1IjoiYXphdmVhIiwiYSI6IkFmMFBYUUUifQ.eYn6znWt8NzYOa3OrWop8A";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function titleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function removeLayerAndSource(map, layer) {
  map.getLayer(layer) && map.removeLayer(layer);
  map.getSource(layer) && map.removeSource(layer);
}

function removeLayer(map, layer) {
  map.getLayer(layer) && map.removeLayer(layer);
}

function removeSource(map, layer) {
  map.getSource(layer) && map.removeSource(layer);
}

var mapOrigin = {
  zoom: 4,
  pitch: 0,
  bearing: 0,
  center: [-96, 37]
};

var dictionary = {
  beds: "Estimated Beds Available (Conventional) - Lower",
  vent: "Estimated Additional Ventilators Required (Conventional) - Lower",
  physicians: "Physicians Required to Staff Beds (Conventional) - Lower",
  rt: "Respiratory Therapist Required to Staff Beds (Conventional) - Lower",
  nurses: "Critical Care Nurse Required to Staff Beds (Conventional) - Lower"
};

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/azavea/ck7z6wmai0zje1ioas2t1bzoo",
  zoom: mapOrigin.zoom,
  center: mapOrigin.center,
  pitch: mapOrigin.pitch,
  bearing: mapOrigin.bearing,
  minZoom: 0,
  maxZoom: 18
});

var nav = new mapboxgl.NavigationControl({
  showCompass: false,
  showZoom: true
});

map.addControl(nav, "top-right");

var popup;

var $body = document.getElementById("body");

// document.onkeydown = function(e) {
//   if (e.key === "Escape") {
//     if ($body.classList.contains("modal-open")) hideModal();
//   }
// };

// var popup = new mapboxgl.Popup({
//   closeButton: false,
//   closeOnClick: false
// });

// function updatePopup(event) {
//   var name = titleCase(event.features[0].properties["Name"]);
//   var beds = event.features[0].properties[dictionary["beds"]];
//   var vent = event.features[0].properties[dictionary["vent"]];
//   var physicians = event.features[0].properties[dictionary["physicians"]];
//   var rt = event.features[0].properties[dictionary["rt"]];
//   var nurses = event.features[0].properties[dictionary["nurses"]];
//   // var countryCode = event.features[0].properties.code;
//   // var name = event.features[0].properties.name;

//   popup.setHTML(
//     "<h1>" +
//       name +
//       "</h1>" +
//       "<table>" +
//       "<tr>" +
//       "<th>" +
//       "Beds" +
//       "</th>" +
//       "<td>" +
//       beds +
//       "</td>" +
//       "</tr>" +
//       "<tr>" +
//       "<th>" +
//       "Ventilators" +
//       "</th>" +
//       "<td>" +
//       vent +
//       "</td>" +
//       "</tr>" +
//       "<tr>" +
//       "<th>" +
//       "Physicians" +
//       "</th>" +
//       "<td>" +
//       physicians +
//       "</td>" +
//       "</tr>" +
//       "<tr>" +
//       "<th>" +
//       "Respitory Therapists" +
//       "</th>" +
//       "<td>" +
//       rt +
//       "</td>" +
//       "</tr>" +
//       "<tr>" +
//       "<th>" +
//       "Nurses" +
//       "</th>" +
//       "<td>" +
//       nurses +
//       "</td>" +
//       "</tr>" +
//       "</table>"
//   );
//   popup.setLngLat(event.lngLat).addTo(map);
//   map.getCanvas().style.cursor = "pointer";
// }

// function removePopup() {
//   popup.remove();
//   map.getCanvas().style.cursor = "";
// }

// map.on("mousemove", "facility-circle", updatePopup);
// map.on("mouseleave", "facility-circle", removePopup);

// var facility;

map.on("load", function() {
  fetch("/data/mock_facility_data.geojson")
    .then(response => {
      return response.json();
    })
    .then(data => {
      // facility = data;

      console.log(data); // map.addSource("boundaries", {
      //   type: "vector",
      //   tiles: [window.location.origin + "/data/tiles/{z}/{x}/{y}.pbf"],
      //   minzoom: 3,
      //   maxzoom: 8
      // });
      // map.addLayer(
      //   {
      //     id: "county-fill",
      //     type: "fill",
      //     source: "boundaries",
      //     "source-layer": "mock_county_data",
      //     paint: {
      //       "fill-color": "transparent"
      //     }
      //   },
      //   "road-label"
      // );
      // map.addLayer(
      //   {
      //     id: "county-line",
      //     type: "line",
      //     source: "boundaries",
      //     "source-layer": "mock_county_data",
      //     paint: {
      //       "line-width": 0.25,
      //       "line-color": "#444"
      //     }
      //   },
      //   "road-label"
      // );
      // map.addLayer(
      //   {
      //     id: "state-fill",
      //     type: "fill",
      //     source: "boundaries",
      //     "source-layer": "mock_state_data",
      //     paint: {
      //       "fill-color": "transparent"
      //     }
      //   },
      //   "road-label"
      // );
      // map.addLayer(
      //   {
      //     id: "state-line",
      //     type: "line",
      //     source: "boundaries",
      //     "source-layer": "mock_state_data",
      //     paint: {
      //       "line-width": 0.75,
      //       "line-color": "#000"
      //     }
      //   },
      //   "road-label"
      // );
      // map.addSource("facility", {
      //   type: "geojson",
      //   data: facility
      // });
      // map.addLayer(
      //   {
      //     id: "facility-circle",
      //     type: "circle",
      //     source: "facility",
      //     paint: {
      //       "circle-radius": [
      //         "interpolate",
      //         ["linear"],
      //         ["zoom"],
      //         3,
      //         [
      //           "interpolate",
      //           ["linear"],
      //           ["get", dictionary["beds"]],
      //           0,
      //           1,
      //           30,
      //           20
      //         ],
      //         10,
      //         [
      //           "interpolate",
      //           ["linear"],
      //           ["get", dictionary["beds"]],
      //           0,
      //           5,
      //           30,
      //           50
      //         ]
      //       ],
      //       "circle-color": [
      //         "interpolate",
      //         ["linear"],
      //         ["get", dictionary["beds"]],
      //         0,
      //         "#e0ecf4",
      //         30,
      //         "#8856a7"
      //       ],
      //       "circle-stroke-color": "#000",
      //       "circle-stroke-width": [
      //         "interpolate",
      //         ["linear"],
      //         ["zoom"],
      //         3,
      //         0.5,
      //         10,
      //         1
      //       ],
      //       "circle-opacity": [
      //         "interpolate",
      //         ["linear"],
      //         ["zoom"],
      //         3,
      //         0.5,
      //         10,
      //         1
      //       ]
      //     }
      //   },
      //   "road-label"
      // );
    });

  //   // map.addSource("world-summary", {
  //   //   type: "vector",
  //   //   tiles: [
  //   //     "https://un-sdg.s3.amazonaws.com/tiles/cardno-world-summary/{z}/{x}/{y}.pbf"
  //   //   ],
  //   //   minzoom: 0,
  //   //   maxzoom: 2
  //   // });
});
