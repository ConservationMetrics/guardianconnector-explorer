export type Column = {
  original_column: string;
  sql_column: string;
};

export type AlertRecord = {
  territory_name: string;
  alert_type: string;
  month_detec: string;
  year_detec: string;
  area_alert_ha: string;
};

export type Metadata = {
  alert_source: string;
  type_alert: string;
  month: number;
  year: number;
  total_alerts: string;
  description_alerts: string;
};

export type AlertsPerMonth = Record<string, number>;

export interface ViewConfig {
  VIEWS: string;
  FILTER_BY_COLUMN: string;
  FILTER_OUT_VALUES_FROM_COLUMN: string;
  FRONT_END_FILTER_COLUMN: string;
  MAPBOX_ACCESS_TOKEN: string;
  MAPBOX_STYLE: string;
  MAPBOX_PROJECTION: string;
  MAPBOX_CENTER_LATITUDE: string;
  MAPBOX_CENTER_LONGITUDE: string;
  MAPBOX_ZOOM: string;
  MAPBOX_PITCH: string;
  MAPBOX_BEARING: string;
  MAPBOX_3D: string;
  MAPEO_TABLE: string;
  MAPEO_CATEGORY_IDS: string;
  MAP_LEGEND_LAYER_IDS: string;
  MEDIA_BASE_PATH: string;
  MEDIA_BASE_PATH_ALERTS: string;
  LOGO_URL: string;
  PLANET_API_KEY: string;
  UNWANTED_COLUMNS?: string;
  UNWANTED_SUBSTRINGS?: string;
}

export interface Views {
  [key: string]: ViewConfig;
}
