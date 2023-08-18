# GuardianConnector map

This is a Mapbox tool for GuardianConnector which connects to a SQLite or PostgreSQL database, and renders tabular GeoJSON data on a map. 

To get started, copy `.env.example` to `.env` and add your database and table information, and a Mapbox access token.

**Database:** use SQLite instead of Postgres, set  `SQLITE` to `YES`.

**Media attachments:** your GeoJSON data is storing filenames for media attachments, you can embed them by setting `EMBED_MEDIA` to `YES` and providing the path to the directory where media attachments are stored in `MEDIA_PATH`.

At this time, media attachments are handled in a somewhat brittle way by rendering any strings that end in the expected photo, audio, or video file ending (such as `.jpg`, `.mp3`, or `.mp4`). We can improve on this later when we know more about how media attachments will be stored in the SQL database, and what kind of metadata we have access to.

**Column headers:** currently, the tool expects these column headers, which follow the structure of a `feature` in a GeoJSON file. You can use these [GeoJSON to SQL conversion scripts](https://github.com/rudokemper/geojson-csv-sql-conversion-tools) to transform your GeoJSON file into the expected format.

| SQL Column | GeoJSON Field |
|------------|---------------|
| id         | id            |
| g\_\_type    | geometry.type |
| g\_\_coordinates | geometry.coordinates |
| p\_\_...     | properties... |
| p\_\_\_...     | properties.$... |

The tool will render the feature on a map in accordance to what kind of `type` it is (Point, LineString, Polygon). The properties fields are shown in a popup opened by clicking on the feature. Currently, we are hiding any metadata fields (prefixed by `$` in the GeoJSON properties).

**GeoJSON formats**: this tool can work with any GeoJSON data stored in the expected tabular format, but the main purpose is to show field data collected using data collection applications such as Mapeo, OpenDataKit (ODK), and KoboToolbox. 

* Mapeo data from Mapeo Desktop is already exported as GeoJSON file. This tool can work with both Territory and Observations data.
* ODK / KoboToolbox API survey data with a geospatial field may be transformed into such a format (as CMI does using [Frizzle](https://github.com/ConservationMetrics/frizzle) components).
* In the future, we can do a similar transformation for Mapeo Cloud API data, if needed.

![GuardianConnector map with KoboToolbox data](public/GuardianConnector-map-1.jpg)
_Example map using KoboToolbox data, with an image and audio attachment embedded._

![GuardianConnector map with Mapeo data](public/GuardianConnector-map-2.jpg)
_Example map using Mapeo data showing all three geometry types._