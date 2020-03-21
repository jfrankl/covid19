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

function setType(newType) {
  var el = this.event.toElement;
  el.parentNode.querySelectorAll("#aggregation button").forEach(function(item) {
    item.classList.remove("active");
  });
  el.classList.add("active");
  type = newType;
  onMapChange();
}

function setScenario(newScenario) {
  var el = this.event.toElement;
  el.parentNode.querySelectorAll("#scenario button").forEach(function(item) {
    item.classList.remove("active");
  });
  el.classList.add("active");
  scenario = newScenario;
  onMapChange();
}

function setIndicator(newIndicator) {
  var el = this.event.toElement;
  el.parentNode.querySelectorAll("#indicator button").forEach(function(item) {
    item.classList.remove("active");
  });
  el.classList.add("active");
  indicator = newIndicator;
  onMapChange();
}

function onMapChange() {
  map.off("mousemove", "facility-circle", updatePopup);
  map.off("mouseleave", "facility-circle", removePopup);
  map.off("mousemove", "county-fill", updatePopup);
  map.off("mouseleave", "county-fill", removePopup);
  map.off("mousemove", "state-fill", updatePopup);
  map.off("mouseleave", "state-fill", removePopup);
  if (type === "facility") {
    setCirclePaintStyle("facility-circle");
    resetFillPaintStyle("state-fill");
    resetFillPaintStyle("county-fill");
    resetLinePaintStyle("state-line");
    resetLinePaintStyle("county-line");
    map.on("mousemove", "facility-circle", updatePopup);
    map.on("mouseleave", "facility-circle", removePopup);
  } else if (type === "county") {
    setFillPaintStyle("county-fill");
    setLinePaintStyle("county-line");
    resetFillPaintStyle("state-fill");
    resetCirclePaintStyle("facility-circle");
    resetLinePaintStyle("state-line");
    map.on("mousemove", "county-fill", updatePopup);
    map.on("mouseleave", "county-fill", removePopup);
  } else if (type === "state") {
    setFillPaintStyle("state-fill");
    setLinePaintStyle("state-line");
    resetFillPaintStyle("county-fill");
    resetCirclePaintStyle("facility-circle");
    resetLinePaintStyle("county-line");
    map.on("mousemove", "state-fill", updatePopup);
    map.on("mouseleave", "state-fill", removePopup);
  }
}

var defaultCircleRadius = ["interpolate", ["linear"], ["zoom"], 3, 0, 10, 0];
var defaultCircleColor = "#000";

var type = "county";
var scenario = "conventional";
var indicator = "beds";

var dictionary = {
  beds: {
    conventional: "Estimated Beds Available (Conventional) - Lower",
    contingency: "Estimated Beds Available (Contingency) - Lower",
    crisis: "Estimated Beds Available (Crisis) - Lower",
    colors: {
      colorFirst: "#e0ecf4",
      colorLast: "#8856a7"
    }
  },
  vent: {
    conventional:
      "Estimated Additional Ventilators Required (Conventional) - Lower",
    contingency:
      "Estimated Additional Ventilators Required (Contingency) - Lower",
    crisis: "Estimated Additional Ventilators Required (Crisis) - Lower",
    colors: {
      colorFirst: "#ece7f2",
      colorLast: "#2b8cbe"
    }
  },
  physicians: {
    conventional: "Physicians Required to Staff Beds (Conventional) - Lower",
    contingency: "Physicians Required to Staff Beds (Contingency) - Lower",
    crisis: "Physicians Required to Staff Beds (Crisis) - Lower",
    colors: {
      colorFirst: "#e5f5f9",
      colorLast: "#2ca25f"
    }
  },
  rt: {
    conventional:
      "Respiratory Therapist Required to Staff Beds (Conventional) - Lower",
    contingency:
      "Respiratory Therapist Required to Staff Beds (Contingency) - Lower",
    crisis: "Respiratory Therapist Required to Staff Beds (Crisis) - Lower",
    colors: {
      colorFirst: "#D6EDEA",
      colorLast: "#345672"
    }
  },
  nurses: {
    conventional:
      "Critical Care Nurse Required to Staff Beds (Conventional) - Lower",
    contingency:
      "Critical Care Nurse Required to Staff Beds (Contingency) - Lower",
    crisis: "Critical Care Nurse Required to Staff Beds (Crisis) - Lower",
    colors: {
      colorFirst: "#EDCDD3",
      colorLast: "#632864"
    }
  }
};

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/azavea/ck7z6wmai0zje1ioas2t1bzoo",
  zoom: 3.5,
  center: [-96, 38],
  minZoom: 3,
  maxZoom: 14,
  hash: true
});

// var nav = new mapboxgl.NavigationControl({
//   showCompass: false,
//   showZoom: true
// });

// map.addControl(nav, "top-right");

var popup;

var $body = document.getElementById("body");

document.onkeydown = function(e) {
  if (e.key === "Escape") {
    if ($body.classList.contains("modal-open")) hideModal();
  }
};

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

function updatePopup(event) {
  if (type === "county") {
    var name = `${event.features[0].properties["NAME"]} County`;
  } else if (type === "facility") {
    var name = (event.features[0].properties["Name"] = titleCase(
      event.features[0].properties["Name"]
    ));
  } else if (type === "state") {
    var name = event.features[0].properties["NAME"];
  }
  var beds = numberWithCommas(
    event.features[0].properties[dictionary["beds"][scenario]]
  );
  var vent = numberWithCommas(
    event.features[0].properties[dictionary["vent"][scenario]]
  );
  var physicians = numberWithCommas(
    event.features[0].properties[dictionary["physicians"][scenario]]
  );
  var rt = numberWithCommas(
    event.features[0].properties[dictionary["rt"][scenario]]
  );
  var nurses = numberWithCommas(
    event.features[0].properties[dictionary["nurses"][scenario]]
  );

  popup.setHTML(
    `<h1>${name}</h1><table><tr><th>Estimated Beds</th><td>${beds}</td></tr><tr><th>Additional ventilators required</th><td>${vent}</td></tr><tr><th>Physicians required</th><td>${physicians}</td></tr><tr><th>Resp. therapists required</th><td>${rt}</td></tr><tr><th>Nurses required</th><td>${nurses}</td></tr></table>`
  );
  popup.setLngLat(event.lngLat).addTo(map);
  map.getCanvas().style.cursor = "pointer";
}

function removePopup() {
  popup.remove();
  map.getCanvas().style.cursor = "";
}

function resetCirclePaintStyle(layerName) {
  map.setPaintProperty(layerName, "circle-radius", defaultCircleRadius);
  map.setPaintProperty(layerName, "circle-color", defaultCircleColor);
}

function resetLinePaintStyle(layerName) {
  map.setLayoutProperty(layerName, "visibility", "none");
}

function setLinePaintStyle(layerName) {
  map.setLayoutProperty(layerName, "visibility", "visible");
}

function resetFillPaintStyle(layerName) {
  map.setPaintProperty(layerName, "fill-color", "transparent");
}

function setFillPaintStyle(layerName) {
  var colors = dictionary[indicator].colors;
  var minMaxValues = minMax[type][dictionary[indicator][scenario]];
  setLegend(colors, minMaxValues);

  map.setPaintProperty(layerName, "fill-color", [
    "interpolate",
    ["linear"],
    ["get", dictionary[indicator][scenario]],
    minMaxValues[0],
    colors.colorFirst,
    minMaxValues[1] + 1,
    colors.colorLast
  ]);
}

function setLegend(colors, minMaxValues) {
  document.getElementById("legend-min").innerHTML = numberWithCommas(
    minMaxValues[0]
  );
  document.getElementById("legend-max").innerHTML = numberWithCommas(
    minMaxValues[1]
  );
  document.getElementById(
    "colors"
  ).style.backgroundImage = `linear-gradient(to right, ${colors.colorFirst}, ${colors.colorLast})`;
}

function setCirclePaintStyle(layerName) {
  var colors = dictionary[indicator].colors;
  var minMaxValues = minMax[type][dictionary[indicator][scenario]];
  setLegend(colors, minMaxValues);

  map.setPaintProperty(layerName, "circle-radius", [
    "interpolate",
    ["linear"],
    ["zoom"],
    3,
    [
      "interpolate",
      ["linear"],
      ["get", dictionary[indicator][scenario]],
      minMaxValues[0],
      1,
      minMaxValues[1] + 1,
      20
    ],
    10,
    [
      "interpolate",
      ["linear"],
      ["get", dictionary[indicator][scenario]],
      minMaxValues[0],
      5,
      minMaxValues[1] + 1,
      50
    ]
  ]);

  map.setPaintProperty(layerName, "circle-color", [
    "interpolate",
    ["linear"],
    ["get", dictionary[indicator][scenario]],
    minMaxValues[0],
    colors.colorFirst,
    minMaxValues[1] + 1,
    colors.colorLast
  ]);
}

var facilities = undefined;
var minMax = undefined;

map.on("load", function() {
  const urls = [
    "/data/mock_facility_data.geojson",
    "/data/state-minmax.json",
    "/data/county-minmax.json",
    "/data/facility-minmax.json"
  ];

  // use map() to perform a fetch and handle the response for each url
  Promise.all(
    urls.map(url =>
      fetch(url).then(function(response) {
        return response.json();
      })
    )
  ).then(data => {
    facilities = data[0];
    minMax = {
      state: data[1],
      county: data[2],
      facility: data[3]
    };

    map.addSource("boundaries", {
      type: "vector",
      tiles: [window.location.origin + "/data/tiles/{z}/{x}/{y}.pbf"],
      minzoom: 3,
      maxzoom: 8
    });

    map.addLayer(
      {
        id: "county-fill",
        type: "fill",
        source: "boundaries",
        "source-layer": "mock_county_data",
        paint: {
          "fill-color": "transparent"
        }
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "county-line",
        type: "line",
        source: "boundaries",
        "source-layer": "mock_county_data",
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.25, 10, 2],
          "line-color": "#000",
          "line-opacity": 0.25
        }
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "state-line",
        type: "line",
        source: "boundaries",
        "source-layer": "mock_state_data",
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.75, 10, 4],
          "line-color": "#000",
          "line-opacity": 0.25
        }
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "state-fill",
        type: "fill",
        source: "boundaries",
        "source-layer": "mock_state_data",
        paint: {
          "fill-color": "transparent"
        }
      },
      "state-line"
    );

    map.addSource("facility", {
      type: "geojson",
      data: facilities
    });

    map.addLayer(
      {
        id: "facility-circle",
        type: "circle",
        source: "facility",
        paint: {
          "circle-radius": defaultCircleRadius,
          "circle-color": defaultCircleColor,
          "circle-stroke-color": "#000",
          "circle-stroke-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            0.5,
            10,
            1
          ],
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.5, 10, 1]
        }
      },
      "road-label"
    );
    onMapChange();
  });
});

function handleFirstTab(e) {
  if (e.keyCode === 9) {
    // the "I am a keyboard user" key
    document.body.classList.add("user-is-tabbing");
    window.removeEventListener("keydown", handleFirstTab);
  }
}

window.addEventListener("keydown", handleFirstTab);
