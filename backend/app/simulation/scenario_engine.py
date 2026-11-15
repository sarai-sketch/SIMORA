"""Transparent first-order scenario calculations for SIMORA.

This module intentionally avoids fabricated crop-loss percentages.
It calculates a simple soil-water balance only when the user supplies
the required soil and crop inputs. Other hazards return the variables
that must be calibrated for a crop-specific impact model.
"""
from typing import Any


SUPPORTED_EVENTS = {
    "drought", "heavy_rain", "frost", "heatwave", "hail", "enso"
}


def _number(value: Any, name: str, minimum=None, maximum=None):
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{name} must be numeric")
    if minimum is not None and number < minimum:
        raise ValueError(f"{name} must be >= {minimum}")
    if maximum is not None and number > maximum:
        raise ValueError(f"{name} must be <= {maximum}")
    return number


def run_scenario(payload: dict) -> dict:
    event = str(payload.get("event", "")).lower()
    if event not in SUPPORTED_EVENTS:
        raise ValueError(f"Unsupported event. Choose one of: {', '.join(sorted(SUPPORTED_EVENTS))}")

    duration_days = _number(payload.get("duration_days", 1), "duration_days", 0.1, 365)
    result = {
        "scenario_type": "hypothetical",
        "event": event,
        "parcel_id": payload.get("parcel_id"),
        "parcel_name": payload.get("parcel_name"),
        "crop": payload.get("crop"),
        "growth_stage": payload.get("growth_stage"),
        "duration_days": duration_days,
        "inputs": {},
        "calculation": None,
        "interpretation": [],
        "limitations": [
            "This is a user-defined what-if scenario, not a weather forecast or official warning.",
            "No crop-loss percentage or yield prediction is generated.",
            "Parcel-level conclusions require verified parcel boundaries and local measurements.",
            "Crop-specific thresholds must be reviewed and calibrated by an agronomist."
        ],
        "required_for_quantitative_impact": []
    }

    if event in ("drought", "heavy_rain"):
        rain_mm = _number(payload.get("precipitation_mm"), "precipitation_mm", 0, 5000)
        irrigation_mm = _number(payload.get("irrigation_mm", 0), "irrigation_mm", 0, 2000)
        et_crop_mm = _number(payload.get("crop_et_mm"), "crop_et_mm", 0, 1000)
        runoff_mm = _number(payload.get("runoff_mm", 0), "runoff_mm", 0, 2000)
        drainage_mm = _number(payload.get("drainage_mm", 0), "drainage_mm", 0, 2000)
        effective_fraction = _number(payload.get("effective_rain_fraction", 0.8), "effective_rain_fraction", 0, 1)
        initial_storage = _number(payload.get("initial_soil_water_mm"), "initial_soil_water_mm", 0, 2000)
        available_capacity = _number(payload.get("available_water_capacity_mm"), "available_water_capacity_mm", 0, 2000)

        result["inputs"] = {
            "precipitation_mm": rain_mm,
            "irrigation_mm": irrigation_mm,
            "crop_et_mm": et_crop_mm,
            "runoff_mm": runoff_mm,
            "drainage_mm": drainage_mm,
            "effective_rain_fraction": effective_fraction,
            "initial_soil_water_mm": initial_storage,
            "available_water_capacity_mm": available_capacity
        }

        if rain_mm is not None and et_crop_mm is not None:
            effective_rain = rain_mm * effective_fraction
            delta_storage = effective_rain + irrigation_mm - et_crop_mm - runoff_mm - drainage_mm
            calculation = {
                "effective_precipitation_mm": round(effective_rain, 2),
                "estimated_change_in_soil_water_mm": round(delta_storage, 2),
                "equation": "ΔS = P_effective + I - ETc - R - D",
                "units": "mm over the scenario period"
            }
            if initial_storage is not None and available_capacity is not None:
                final_storage = max(0.0, min(available_capacity, initial_storage + delta_storage))
                calculation["estimated_final_soil_water_mm"] = round(final_storage, 2)
                calculation["available_water_capacity_mm"] = available_capacity
                if initial_storage + delta_storage > available_capacity:
                    calculation["potential_excess_above_capacity_mm"] = round(
                        initial_storage + delta_storage - available_capacity, 2
                    )
                if initial_storage + delta_storage < 0:
                    calculation["potential_unmet_water_demand_mm"] = round(
                        -(initial_storage + delta_storage), 2
                    )
            result["calculation"] = calculation
            result["interpretation"].append(
                "The water-balance result is a simplified estimate. It depends on the user-supplied effective-rain fraction, crop evapotranspiration, runoff, drainage, and soil-water storage."
            )
        else:
            result["required_for_quantitative_impact"].extend(
                ["precipitation_mm", "crop_et_mm"]
            )

    elif event == "frost":
        minimum_temp = _number(payload.get("minimum_temperature_c"), "minimum_temperature_c", -80, 20)
        result["inputs"] = {"minimum_temperature_c": minimum_temp}
        result["required_for_quantitative_impact"] = [
            "crop-specific critical temperature by growth stage",
            "exposure duration below the critical temperature",
            "cultivar and acclimation information",
            "local canopy or near-surface temperature if available"
        ]
        result["interpretation"].append(
            "Frost injury cannot be inferred from air temperature alone; crop and growth-stage thresholds are required."
        )

    elif event == "heatwave":
        maximum_temp = _number(payload.get("maximum_temperature_c"), "maximum_temperature_c", -20, 65)
        result["inputs"] = {"maximum_temperature_c": maximum_temp}
        result["required_for_quantitative_impact"] = [
            "crop-specific heat threshold by growth stage",
            "hours or days above the threshold",
            "soil-water availability and irrigation status",
            "humidity and wind conditions"
        ]
        result["interpretation"].append(
            "Heat stress depends on threshold, duration, crop stage, and water status; a maximum temperature alone is insufficient."
        )

    elif event == "hail":
        hail_diameter = _number(payload.get("hail_diameter_cm"), "hail_diameter_cm", 0, 15)
        result["inputs"] = {"hail_diameter_cm": hail_diameter}
        result["required_for_quantitative_impact"] = [
            "hailstone size distribution and kinetic energy",
            "storm duration and wind",
            "crop species, cultivar, and growth stage",
            "plant density and field observations"
        ]
        result["interpretation"].append(
            "Hail damage is highly crop- and stage-dependent. Do not convert hail diameter alone into a crop-loss percentage."
        )

    elif event == "enso":
        phase = payload.get("enso_phase")
        result["inputs"] = {"enso_phase": phase}
        result["required_for_quantitative_impact"] = [
            "official ENSO outlook and issue date",
            "regional seasonal precipitation and temperature outlook",
            "local crop calendar and water availability"
        ]
        result["interpretation"].append(
            "ENSO is a large-scale climate driver. Regional impacts are probabilistic and vary by season and location; ENSO phase alone does not determine local weather."
        )

    return result
