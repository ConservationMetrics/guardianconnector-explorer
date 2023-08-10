# GuardianConnector map

This is a Mapbox tool for GuardianConnector which connects to a SQLite or PostgreSQL database, and renders tabular GeoJSON data on a map. 

To get started, copy `.env.example` to `.env` and add your database and table information, a and Mapbox access token.

To use SQLite instead of Postgres, set the `SQLITE` value to `YES`.

For now, media attachments are only shown by their filename, but we can embed them once the files are stored somewhere with a URI.

Currently, the tool expects these column headers, which follow the structure of a `feature` in a GeoJSON file. You can use these [GeoJSON to SQL conversion scripts](https://github.com/rudokemper/geojson-csv-sql-conversion-tools) to transform your GeoJSON file into the expected format.

| SQL Column | GeoJSON Field |
|------------|---------------|
| id         | id            |
| g\_\_type    | geometry.type |
| g\_\_coordinates | geometry.coordinates |
| p\_\_...     | properties... |
| p\_\_\_...     | properties.$... |

The tool will render the feature on a map in accordance to what kind of `type` it is (Point, LineString, Polygon). The properties fields are shown in a popup opened by clicking on the feature. Currently, we are hiding any metadata fields (prefixed by `$` in the GeoJSON properties).

The tool can work with any GeoJSON data stored in the expected tabular format, but the main purpose is to show field data collected using data collection applications such as Mapeo, OpenDataKit (ODK), and KoboToolbox. 

* Mapeo data from Mapeo Desktop is already exported as GeoJSON file.
* ODK / KoboToolbox API survey data with a geospatial field may be transformed into such a format (as CMI does using [Frizzle]([Frizzle](https://github.com/ConservationMetrics/frizzle)) components).
* In the future, we can do a similar transformation for Mapeo Cloud API data, if needed.

![GuardianConnector map with KoboToolbox data](public/GuardianConnector-map-1.jpg)
_Example map using KoboToolbox data._

![GuardianConnector map with Mapeo data](public/GuardianConnector-map-2.jpg)
_Example map using Mapeo data._