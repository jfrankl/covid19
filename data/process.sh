rm -rf tiles

tippecanoe -f -pk --no-tile-compression -o input/state.mbtiles --maximum-zoom=10 --minimum-zoom=2 -l state input/us_healthcare_capacity-state-CovidCareMap.geojson

tippecanoe -f -pk --no-tile-compression -o input/county.mbtiles --maximum-zoom=10 --minimum-zoom=2 -l county input/us_healthcare_capacity-county-CovidCareMap.geojson

tippecanoe -f -pk --no-tile-compression -o input/hrr.mbtiles --maximum-zoom=10 --minimum-zoom=2 -l hrr input/us_healthcare_capacity-hrr-CovidCareMap.geojson

tippecanoe -f -pk -pf --no-tile-compression -o input/facility.mbtiles --maximum-zoom=10 --minimum-zoom=2 -B 0 -l facility input/us_healthcare_capacity-facility-CovidCareMap.geojson

tile-join -f -pk --no-tile-compression -o input/combined.mbtiles input/county.mbtiles input/state.mbtiles input/hrr.mbtiles input/facility.mbtiles

mb-util --image_format=pbf input/combined.mbtiles tiles

# mb-util --image_format=pbf input/facility.mbtiles tiles
