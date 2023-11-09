# GuardianConnector Views

This is a [Nuxt](https://nuxt.com/) tool for GuardianConnector which builds an API from a SQLite or PostgreSQL database, and renders tabular data from one or more tables on different views including a map and a media gallery.

## Configure

To get started, copy `.env.example` to `.env` and add your database and table information, authentication, and a Mapbox access token.

**Authentication:** Authentication is optional. If you want to use authentication, set `USE_PASSWORD` to "YES". If not, your pages and components can be accessed without needing users to log in.

**Auth0 authentication:** GuardianConnector Views supports an auth0 strategy. Add your env variables for auth0 to get this to work. 

**Local authentication:** GuardianConnector Views can be protected through password and a JavaScript Web Token using the local strategy. You can set the password using `PASSWORD`, and also set a `SECRET_JWT_KEY` to authenticate using the browser, by appending `?secret_key=` to the end of your path.

**Mapbox:** You can optionally provide a Mapbox style, projection, center lat/long, zoom level, pitch, bearing, and if you want the map to render with a 3D terrain layer.

**Database:** To use SQLite instead of Postgres, set  `SQLITE` to `YES` and provide a path value for `SQLITE_DB_PATH`.

**Tables:** GuardianConnector Views can render multiple tables. You can specify the tables in your database in `NUXT_ENV_TABLES`, separated by commas. For each table, there will be `map` and (if media attachments are enabled) `gallery` routes. All of the possible view routes are shown in the `/` index.html route.

**Media attachments:** If your data is storing filenames for media attachments, you can embed them by setting `EMBED_MEDIA` to `YES`, and by providing the path to the exact location where media attachments are stored in `MEDIA_PATH`. If this variable is not set to `YES`, then the gallery view will be disabled.

**Dropdown filter:** You can enable a dropdown that allows you to filter the data on your views. Set `FRONT_END_FILTERING` to `YES` and provide a value for `FRONT_END_FILTER_FIELD` (e.g. "Category" which could be a good choice for Mapeo data).

**Unwanted columns and substrings:** Many outputs from data collection APIs have a lot of extraneous metadata fields that are not useful to the end user. See [docs/schema.md](docs/schema.md) for a list of these fields that are output by popular data collection APIs. You can determine which fields to filter out in `UNWANTED_COLUMNS` (exact column names will be filtered) and `UNWANTED_SUBSTRINGS` (all columns which include these substrings will be filtered).

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:8080
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

Add `--hostname 0.0.0.0` if you want the app to be accessible across your local network.

## Deployment

For deployment (e.g.) on Azure, the following additional env vars are needed:

```
HOST: 0.0.0.0
NODE_ENV: production
```

## How it works

![GuardianConnector Map with KoboToolbox data](docs/GuardianConnector-Map.jpg)
_Map view using sample KoboToolbox data, with an image and audio attachment embedded._

![GuardianConnector Gallery with KoboToolbox data](docs/GuardianConnector-Gallery.jpg)
_Gallery view using sample KoboToolbox data._

### Column headers ###

Currently, GuardianConnector expects these column headers, which follow the structure of a GeoJSON feature. You can use these [GeoJSON to SQL conversion scripts](https://github.com/rudokemper/geojson-csv-sql-conversion-tools) to transform your GeoJSON file into the expected format if needed.

| SQL Column | GeoJSON Field |
|------------|---------------|
| id         | id            |
| g\_\_type    | geometry.type |
| g\_\_coordinates | geometry.coordinates |
| p\_\_...     | properties... |
| p\_\_\_...     | properties.$... |

If found, GuardianConnector Views will use the column mapping SQL table (with "__column" suffix) created by the `warehouse` component of [Frizzle](https://github.com/ConservationMetrics/frizzle) to handle filtering and key/value rewrites.

 Any fields specified in the `.env` file will be filtered out (*see "Unwanted columns and substrings" above*).

At this time, media attachments in the popups are handled in a somewhat brittle way by embedding any strings that end in the expected photo, audio, or video file ending (such as `.jpg`, `.mp3`, or `.mp4`). We can improve on this later when we know more about how media attachments will be stored in the SQL database, and what kind of metadata we have access to.

### GeoJSON export formats for map view ###

The GuardianConnector Views map will render the feature on a map in accordance to what kind of `type` it is (Point, LineString, Polygon). The properties fields are shown in a popup opened by clicking on the feature.

The GuardianConnector Views map can work with any GeoJSON data stored in the expected tabular format, but the main purpose is to visualize field data collected using data collection applications such as Mapeo, OpenDataKit (ODK), and KoboToolbox. 

* Mapeo data from Mapeo Desktop is already exported as GeoJSON file. GuardianConnector map can work with both Observations and Territory data.
* ODK / KoboToolbox API survey data with a geospatial field may be transformed into such a format (as CMI does using [Frizzle](https://github.com/ConservationMetrics/frizzle) components).
* In the future, we can do a similar transformation for Mapeo Cloud API data, if needed.
