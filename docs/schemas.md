# Known API export schemas

Documentation for the known API export schemas for data collection applications, or other data sources that we may want to show on the map. You can use this information to help construct filters or key/value rewrites, in order to hide or style data on the marker popups.

## Frizzle

Not an external API, but important to document here - the Frizzle warehouse component adds some metadata columns for each message that it receives and writes to the SQL database. Currently, these are:

* `_topic`

## KoboToolbox

The KoboToolbox API includes the following metadata fields per each submission, which are likely not useful to the map viewer:

* `meta/instanceID`
* `meta/instanceName`
* `formhub/uuid`
* `_attachments`
* `_geolocation`
* `_id`
* `_notes`
* `_uuid`
* `_sender`
* `_status`
* `_submission_time`
* `_submitted_by`
* `_supplementalDetails`
* `_tags`
* `_xform_id_string`
* `_validation_status`
* `__version__`

Additionally, you may choose to filter out these fields that are commonly added to a KoboToolbox form for record keeping purposes, but possibly not relevant to show on this map:

* `start`
* `end`
* `today`

## ODK

The KoboToolbox API includes the following metadata fields per each submission, which are likely not useful to the map viewer:

* `_id`
* `meta`

Additionally, you may choose to filter out these fields that are commonly added to a KoboToolbox form for record keeping purposes, but possibly not relevant to show on this map:

* `start`
* `end`
* `today`

## Mapeo

While we don't know (yet) about the schema for the future Mapeo Cloud API, we know that Mapeo data exported from Mapeo Desktop is in a GeoJSON format, with `type`, `geometry`, `id`, and `properties` keys.

All of the tag fields are stored in `properties`. The main category key is `categoryId` and the primary data entry field for Mapeo Mobile ("What is happening here?) is `notes`.

Additionally, there are metadata fields stored in `properties` prefixed by `$`. The file attachments (photos) field is handled in this way as well:

* `$created`
* `$modified`
* `$version`
* `$photos`