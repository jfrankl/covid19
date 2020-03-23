mapboxgl.accessToken =
  "pk.eyJ1IjoiYXphdmVhIiwiYSI6IkFmMFBYUUUifQ.eYn6znWt8NzYOa3OrWop8A";

function numberWithCommas(x) {
  return Number.isInteger(x)
    ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : !isNaN(x)
    ? x.toFixed(2)
    : "N/A";
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
  var el = this.event.target;
  el.parentNode.querySelectorAll("#indicator button").forEach(function(item) {
    item.classList.remove("active");
  });
  el.classList.add("active");
  indicator = newIndicator;
  onMapChange();
}

function setNumber() {
  number = this.event.target.value;
  onMapChange();
}

function onMapChange() {
  map.off("mousemove", "state-fill", updatePopup);
  map.off("mouseleave", "state-fill", removePopup);
  map.off("mousemove", "county-fill", updatePopup);
  map.off("mouseleave", "county-fill", removePopup);
  map.off("mousemove", "hrr-fill", updatePopup);
  map.off("mouseleave", "hrr-fill", removePopup);
  map.off("mousemove", "facility-circle", updatePopup);
  map.off("mouseleave", "facility-circle", removePopup);
  resetFillPaintStyle("state-fill");
  resetLinePaintStyle("state-line");
  resetFillPaintStyle("county-fill");
  resetLinePaintStyle("county-line");
  resetFillPaintStyle("hrr-fill");
  resetLinePaintStyle("hrr-line");
  resetCirclePaintStyle("facility-circle");
  if (usePerCaptia()) {
    document.getElementById("number").classList.remove("disabled");
  } else {
    document.getElementById("number").classList.add("disabled");
  }
  if (type === 0) {
    setFillPaintStyle("state-fill");
    setLinePaintStyle("state-line");
    map.on("mousemove", "state-fill", updatePopup);
    map.on("mouseleave", "state-fill", removePopup);
  } else if (type === 1) {
    setFillPaintStyle("county-fill");
    setLinePaintStyle("county-line");
    map.on("mousemove", "county-fill", updatePopup);
    map.on("mouseleave", "county-fill", removePopup);
  } else if (type === 2) {
    setFillPaintStyle("hrr-fill");
    setLinePaintStyle("hrr-line");
    map.on("mousemove", "hrr-fill", updatePopup);
    map.on("mouseleave", "hrr-fill", removePopup);
  } else if (type === 3) {
    setCirclePaintStyle("facility-circle");
    map.on("mousemove", "facility-circle", updatePopup);
    map.on("mouseleave", "facility-circle", removePopup);
  }
}

var defaultCircleRadius = 0;
var defaultCircleColor = "transparent";

var type = 1;
var number = 1;
var indicator = 0;

var types = [
  {
    id: "state",
    label: "State",
    nameProperty: "State Name",
    includeState: false
  },
  {
    id: "county",
    label: "County",
    nameProperty: "County Name",
    includeState: true
  },
  { id: "hrr", label: "HRR", nameProperty: "HRRCITY", includeState: false },
  {
    id: "facility",
    label: "Facility",
    nameProperty: "Name",
    includeState: false
  }
];

var numbers = [
  { label: "normal", stringInData: "" },
  { label: "per 100 people", stringInData: " [Per 1000 People]" },
  { label: "per 1000 adults (20+)", stringInData: " [Per 1000 Adults (20+)]" },
  { label: "per 1000 elderly (65+)", stringInData: " [Per 1000 Elderly (65+)]" }
];

var indicators = [
  {
    propertyInData: "Staffed All Beds",
    label: "Staffed All Beds",
    colors: ["#e0ecf4", "#8856a7"]
  },
  {
    propertyInData: "Staffed ICU Beds",
    label: "Staffed ICU Beds",
    colors: ["#ece7f2", "#2b8cbe"]
  },
  {
    propertyInData: "Licensed All Beds",
    label: "Licensed All Beds",
    colors: ["#e5f5f9", "#2ca25f"]
  },
  {
    propertyInData: "All Bed Occupancy Rate",
    label: "All Bed Occupancy Rate",
    colors: ["#D6EDEA", "#345672"]
  },
  {
    propertyInData: "ICU Bed Occupancy Rate",
    label: "ICU Bed Occupancy Rate",
    colors: ["#EDCDD3", "#632864"]
  }
];

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/azavea/ck7z6wmai0zje1ioas2t1bzoo",
  zoom: 3.5,
  center: [-96, 38],
  minZoom: 3,
  maxZoom: 14,
  hash: true
});

var nav = new mapboxgl.NavigationControl({
  showCompass: false,
  showZoom: true
});

map.addControl(nav, "top-right");

map.dragRotate.disable();

map.touchZoomRotate.disableRotation();

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
  var feature = event.features[0];
  var nameProperty = types[type]["nameProperty"];
  var name = feature.properties[nameProperty];

  if (types[type].includeState) {
    name += ", " + feature.properties["State"];
  }

  var rows = indicators
    .map(function(theIndicator, i) {
      return (
        "<tr><th>" +
        theIndicator.label +
        "</th><td>" +
        numberWithCommas(feature.properties[getProperty(i)]) +
        "</td></tr>"
      );
    })
    .join("");

  popup.setHTML(`<h1>${name}</h1><table>${rows}</table>`);
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
  map.setLayoutProperty(layerName, "visibility", "none");
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

function usePerCaptia() {
  return number !== 3 && indicator !== 3 && indicator !== 4 && type !== 3;
}

function getProperty(theIndicator) {
  var indicatorProperty = indicators[theIndicator]["propertyInData"];
  if (usePerCaptia()) {
    indicatorProperty += numbers[number]["stringInData"];
  }
  return indicatorProperty;
}

function getMinMax() {
  console.log(minMax[type], getProperty(indicator));
  return minMax[type][getProperty(indicator)];
}

function setFillPaintStyle(layerName) {
  var colors = indicators[indicator].colors;
  var minMaxValues = getMinMax();
  setLegend(colors, minMaxValues);

  map.setPaintProperty(layerName, "fill-color", [
    "interpolate",
    ["linear"],
    ["get", getProperty(indicator)],
    minMaxValues[0],
    colors[0],
    minMaxValues[1],
    colors[1]
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
  ).style.backgroundImage = `linear-gradient(to right, ${colors[0]}, ${
    colors[1]
  })`;
}

function setCirclePaintStyle(layerName) {
  var colors = indicators[indicator].colors;
  var minMaxValues = getMinMax();
  console.log(colors, minMaxValues);
  map.setLayoutProperty(layerName, "visibility", "visible");
  setLegend(colors, minMaxValues);

  map.setPaintProperty(layerName, "circle-radius", [
    "interpolate",
    ["linear"],
    ["zoom"],
    3,
    [
      "interpolate",
      ["linear"],
      ["get", getProperty(indicator)],
      minMaxValues[0],
      1,
      minMaxValues[1],
      20
    ],
    10,
    [
      "interpolate",
      ["linear"],
      ["get", getProperty(indicator)],
      minMaxValues[0],
      5,
      minMaxValues[1],
      50
    ]
  ]);

  map.setPaintProperty(layerName, "circle-color", [
    "interpolate",
    ["linear"],
    ["get", getProperty(indicator)],
    minMaxValues[0],
    colors[0],
    minMaxValues[1],
    colors[1]
  ]);
}

var facilities = undefined;
var minMax = undefined;

map.on("load", function() {
  const urls = [
    "/data/ccm_state_min_max_values.json",
    "/data/ccm_county_min_max_values.json",
    "/data/ccm_hrr_min_max_values.json",
    "/data/ccm_facility_min_max_values.json"
  ];
  Promise.all(
    urls.map(url =>
      fetch(url).then(function(response) {
        return response.json();
      })
    )
  ).then(data => {
    minMax = [data[0], data[1], data[2], data[3]];

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
        "source-layer": "county",
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
        "source-layer": "county",
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
        id: "hrr-fill",
        type: "fill",
        source: "boundaries",
        "source-layer": "hrr",
        paint: {
          "fill-color": "transparent"
        }
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "hrr-line",
        type: "line",
        source: "boundaries",
        "source-layer": "hrr",
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
        "source-layer": "state",
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
        "source-layer": "state",
        paint: {
          "fill-color": "transparent"
        }
      },
      "state-line"
    );

    // map.addSource("facility", {
    //   type: "geojson",
    //   data: facilities
    // });

    map.addLayer(
      {
        id: "facility-circle",
        type: "circle",
        source: "boundaries",
        "source-layer": "facility",
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
