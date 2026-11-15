export type ScenarioEvent =
  | "drought"
  | "heavy_rain"
  | "frost"
  | "heatwave"
  | "hail"
  | "enso";

export interface ScenarioRequest {
  event: ScenarioEvent;
  parcel_id?: string;
  parcel_name?: string;
  crop?: string;
  growth_stage?: string;
  duration_days?: number;
  precipitation_mm?: number;
  irrigation_mm?: number;
  crop_et_mm?: number;
  runoff_mm?: number;
  drainage_mm?: number;
  effective_rain_fraction?: number;
  initial_soil_water_mm?: number;
  available_water_capacity_mm?: number;
  minimum_temperature_c?: number;
  maximum_temperature_c?: number;
  hail_diameter_cm?: number;
  enso_phase?: string;
}

export interface ScenarioResult {
  scenario_type: "hypothetical";
  event: ScenarioEvent;
  parcel_id?: string | null;
  parcel_name?: string | null;
  crop?: string | null;
  growth_stage?: string | null;
  duration_days: number;
  inputs: Record<string, string | number | null>;
  calculation?: Record<string, string | number> | null;
  interpretation: string[];
  limitations: string[];
  required_for_quantitative_impact: string[];
  adaptation_options?: string[];
  data_provenance?: Record<string, string>;
}
