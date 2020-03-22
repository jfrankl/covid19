This visualization was built using vanilla javascript and Mapbox GL JS.

To generate vector tiles:

1. Install tippecanoe and mbutil if you don't already have them
2. Create a directory `input` inside the directory `data`
3. Add `us_healthcare_capacity-x-CovidCareMap.geojson` files to the `input` directory
4. `cd data`
5. Run `bash process.sh`
