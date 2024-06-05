# Views configuration (`NUXT_ENV_VIEWS_CONFIG`)

Currently, the configuration for specific tables and views in a *GuardianConnector Views* deployment is done by setting the multi-line environmental variable `NUXT_ENV_VIEWS_CONFIG`.

GuardianConnector Views can render multiple tables and you can determine which views to show for each table. The `NUXT_ENV_VIEWS_CONFIG` is a configuration object where each nested key corresponds to a specific table in your database. For each table, there's an array of settings under its key, which will be applied to configure the views associated with that table. The basic structure is as follows:

```json
NUXT_ENV_VIEWS_CONFIG = "{
    'kobo_form_submissions': {
        'properties': ...  // Settings for the 'kobo_form_submissions' table views
    },
    'mapeo_field_data': {
        'properties': ...  // Settings for the 'mapeo_field_data' table views
    },
    // Additional tables and their view settings can be added here
}"
```

## Views Configuration Settings

Each table in your `NUXT_ENV_VIEWS_CONFIG` can be customized using the following settings:

#### `VIEWS` (required)

Specify the views for each table, separated by commas. The table will be accessible in the specified views. 

Currently available options:

* `map` 
* `gallery`
* `alerts`
  
The routes for all views are listed on the index.html route (`/`).

#### `ALERT_RESOURCES` (optional)

If your alerts data comes with map resources to visualize, then you can set this to `YES` to provide links to access or download the map resouces.

#### `EMBED_MEDIA` (optional) and `MEDIA_BASE_PATH` (optional)

Enables embedding of media filenames from the database in the Gallery or Map views. Set to `YES` and specify the base path for media files in `MEDIA_BASE_PATH`. If neither are set, the gallery view will be disabled for this table.

For alerts, you need to provide a separate base path for alerts. Append your `MEDIA_BASE_PATH` variable with `_ALERTS`. If you are also using Mapeo data, then provide a separate `MEDIA_BASE_PATH` value.

#### `FRONT_END_FILTERING` (optional)

Activates a dropdown filter for data in views. Set to `YES` and define the field for filtering in `FRONT_END_FILTER_FIELD`.

#### `FRONT_END_FILTER_FIELD` (optional)

Depending on your data, you will want to use a meaningful field for filtering (for example, `Category` for Mapeo data). This variable defines the field used for front-end dropdown filtering.

#### `GFW_API_KEY` (optional)

If you want to show Global Forest Watch data on your alerts dashboard, provide an API key. Note that GFW API keys expire after one year, and need to be refreshed with a bearer token: https://www.globalforestwatch.org/help/developers/guides/create-and-use-an-api-key/

#### `GFW_AOI` (optional)

If you want to show Global Forest Watch data on your alerts dashboard, provide an AOI (Area of Interest) where you want to query GFW data. It should be in format `[[long,lat],[long,lat]...]`.

#### `LOGO_URL` (optional)

You can provide a URL to your organization / community logo which will show up in the Alerts dashboard intro panel.

#### `MAPBOX_STYLE` (optional)

You can provide your own style for any views that utilize a map.

#### `MAPBOX_PROJECTION` (optional)

Specify the Mapbox map projection.

#### `MAPBOX_CENTER_LATITUDE` (optional) and `MAPBOX_CENTER_LONGITUDE` (optional)

Set the center latitude and longitude for the Mapbox map.

#### `MAPBOX_ZOOM` (optional)

Define the initial zoom level for the Mapbox map.

#### `MAPBOX_PITCH` and `MAPBOX_BEARING` (optional)

Adjust the pitch and bearing for the Mapbox map view.

#### `MAPBOX_3D` (optional)

Enable a 3D terrain layer in the Mapbox map.

#### `MAPEO_TABLE` (optional, for Alerts view)

For showing Mapeo data on the Alerts Dashboard, provide the name of the Mapeo database table.

#### `MAPEO_CATEGORY_IDS` (optional, for Alerts view)

For showing Mapeo data on the Alerts Dashboard, provide a comma-separated list of `categoryId` values that you want to show.

#### `MAP_LEGEND_LAYER_IDS` (optional)

A comma-separated list of Mapbox layer ids to be rendered in an optional map legend component. In the component, the layer `type` and `color` will be used to set the legend symbol style (currently supported: fill, line, circle), and the layer `id` will be set as the legend description. Note that we are currently only supporting adding layers to the legend where the color is directly set and not across zoom / data range or with data conditions.

#### `PLANET_API_KEY` (optional)

Provide a Planet NICFI Monthly Basemaps API key to enable the option to use the monthly basemaps as a style option in the basemap selector menu.

#### `UNWANTED_COLUMNS` (optional) and `UNWANTED_SUBSTRINGS` (optional)

List the exact column names (`UNWANTED_COLUMNS`) and/or columns containing specific substrings (`UNWANTED_SUBSTRINGS`) to be filtered out from data collection APIs. Useful for removing unnecessary metadata fields.

Many outputs from data collection APIs have a lot of extraneous metadata fields that are not useful to the end user. See [schema.md](schema.md) for a list of these fields that are output by popular data collection APIs.
