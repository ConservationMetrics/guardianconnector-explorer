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
  _topic: string;
};

export type Metadata = {
  type_alert: string;
  month: string;
  year: string;
  total_alerts: string;
  description_alerts: string;
};
